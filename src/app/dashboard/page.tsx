"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../supabase";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import Sales from "@/components/sales/page";
import { useSwipeable } from "react-swipeable";

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full screen height */
  max-width: 1000px;
  margin: 0 auto;
  background-color: #202020;
`;

const EarningsSection = styled.div`
  text-align: center;
  background-color: #202020;
  padding: 24px;
  flex-shrink: 0; /* Prevent it from shrinking */
`;

const EarningsText = styled.h2`
  font-size: 2.5rem;
  color: white;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: space-around;
  box-shadow: 0px 10px 5px #101010;
  z-index: 10;
`;

const TabButton = styled.button<{ isactive: boolean }>`
  flex: 1;
  padding: 10px 0;
  background-color: #202020;
  border: none;
  border-bottom: ${(props) => (props.isactive ? "3px solid white" : "none")};
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
  text-align: center;
  margin-bottom: 12px;
`;

const SalesSection = styled.div`
  flex: 1; /* Allow the sales section to take up the remaining space */
  overflow-y: auto; /* Make it scrollable */
`;

const AddSaleButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  box-shadow: 0px -10px 5px #101010;
  z-index: 10;
`;
const AddSaleButton = styled.button`
  padding: 12px;
  background-color: #303030;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;
  flex-shrink: 0; /* Prevent shrinking */
  position: sticky;
  bottom: 0; /* Fix the button to the bottom of the screen */
  width: 12%;
  aspect-ratio: 1 / 1;
  border-radius: 100%;
`;

interface Sale {
  id: string;
  name: string;
  status: string;
  install_date: string;
  created_at: string;
  number: string;
}

export default function Dashboard() {
  const [earnings, setEarnings] = useState<number>(0);
  const [sales, setSales] = useState<Sale[]>([]); // Replacing 'any[]' with 'Sale[]'
  const [activeTab, setActiveTab] = useState<string>("not called");
  const router = useRouter();

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (activeTab === "not called") handleTabChange("called");
      else if (activeTab === "called") handleTabChange("installed");
      else if (activeTab === "installed") handleTabChange("annulled");
    },
    onSwipedRight: () => {
      if (activeTab === "annulled") handleTabChange("installed");
      else if (activeTab === "installed") handleTabChange("called");
      else if (activeTab === "called") handleTabChange("not called");
    },
    trackMouse: true, // Enable swipe-like gestures using mouse
  });

  // Function to update earnings based on the current sales
  const updateEarnings = (salesData: Sale[]) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0 - January, 11 - December
    const nextMonth = (currentMonth + 1) % 12; // If current month is December (11), nextMonth will be January (0)

    // Filter out annulled sales and sales with install dates in next month
    const validSales = salesData.filter((sale) => {
      const installDate = new Date(sale.install_date);
      const installMonth = installDate.getMonth();

      // Exclude annulled sales and sales with install date in the next month
      return sale.status !== "annulled" && installMonth !== nextMonth;
    });

    let totalEarnings = 0;
    const saleCount = validSales.length;

    if (saleCount >= 25) {
      totalEarnings = saleCount * 2500;
    } else if (saleCount >= 20) {
      totalEarnings = saleCount * 2200;
    } else if (saleCount >= 15) {
      totalEarnings = saleCount * 2000;
    } else if (saleCount >= 10) {
      totalEarnings = saleCount * 1800;
    } else {
      totalEarnings = saleCount * 1500;
    }

    if (saleCount >= 10) {
      totalEarnings += 10000;
    }

    setEarnings(totalEarnings);
  };

  // Fetch all sales and calculate earnings dynamically
  useEffect(() => {
    const fetchSalesData = async () => {
      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .select("*");

      if (salesError) {
        console.error(salesError.message);
      } else {
        setSales(salesData || []);
        updateEarnings(salesData || []);
      }
    };

    fetchSalesData();
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Update the sale status and the earnings when a sale's status changes
  const handleStateSwitch = async (saleId: string, newStatus: string) => {
    const { error } = await supabase
      .from("sales")
      .update({ status: newStatus }) // Update sale's status
      .eq("id", saleId); // Find the sale by ID

    if (error) {
      console.error("Error updating sale status:", error);
    } else {
      const updatedSales = sales.map((sale) =>
        sale.id === saleId ? { ...sale, status: newStatus } : sale
      );
      setSales(updatedSales);
      updateEarnings(updatedSales);
    }
  };

  const handleAddSale = () => {
    router.push("/addSale");
  };

  return (
    <Container {...swipeHandlers}>
      <EarningsSection>
        <EarningsText>{earnings}:-</EarningsText>
      </EarningsSection>

      <Tabs>
        <TabButton
          isactive={activeTab === "not called"}
          onClick={() => handleTabChange("not called")}
        >
          Not Called
        </TabButton>
        <TabButton
          isactive={activeTab === "called"}
          onClick={() => handleTabChange("called")}
        >
          Called
        </TabButton>
        <TabButton
          isactive={activeTab === "installed"}
          onClick={() => handleTabChange("installed")}
        >
          Installed
        </TabButton>
        <TabButton
          isactive={activeTab === "annulled"}
          onClick={() => handleTabChange("annulled")}
        >
          Annulled
        </TabButton>
      </Tabs>

      <SalesSection>
        <Sales
          activeTab={activeTab}
          sales={sales}
          handleStateSwitch={handleStateSwitch}
        />
      </SalesSection>

      <AddSaleButtonContainer onClick={handleAddSale}>
        <AddSaleButton onClick={handleAddSale}>+</AddSaleButton>
      </AddSaleButtonContainer>
    </Container>
  );
}
