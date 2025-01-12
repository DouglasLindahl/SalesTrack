"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../supabase";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import Sales from "@/components/sales/page";

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

const TabButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 10px 0;
  background-color: #202020;
  border: none;
  border-bottom: ${(props) => (props.isActive ? "3px solid white" : "none")};
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

const AddSaleButton = styled.button`
  padding: 12px;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;
  margin-top: 20px;
  flex-shrink: 0; /* Prevent shrinking */
  position: sticky;
  bottom: 0; /* Fix the button to the bottom of the screen */
  width: 100%;
  &:hover {
    background-color: #005bb5;
  }
`;

const Dashboard = () => {
  const [earnings, setEarnings] = useState<number>(0);
  const [sales, setSales] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("not called");
  const router = useRouter();

  // Function to update earnings based on the current sales
  const updateEarnings = (salesData: any[]) => {
    // Get the current date and calculate the current and next month
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

    // Calculate the earnings
    let totalEarnings = 0;
    const saleCount = validSales.length;

    // Add earnings based on the number of valid sales
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

    // Add the bonus if there are 10 or more sales
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
  }, [activeTab]); // Re-fetch sales data when the activeTab changes

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Update the sale status and the earnings when a sale's status changes
  const handleStateSwitch = async (saleId: string, newStatus: string) => {
    const { data, error } = await supabase
      .from("sales")
      .update({ status: newStatus }) // Update sale's status
      .eq("id", saleId); // Find the sale by ID

    if (error) {
      console.error("Error updating sale status:", error);
    } else {
      // Update the local sales state and earnings immediately
      const updatedSales = sales.map((sale) =>
        sale.id === saleId ? { ...sale, status: newStatus } : sale
      );
      setSales(updatedSales);
      updateEarnings(updatedSales);
    }
  };

  const handleAddSale = () => {
    router.push("/addSale"); // Redirect to the page where you can add new sales
  };

  return (
    <Container>
      <EarningsSection>
        <EarningsText>{earnings}:-</EarningsText>
      </EarningsSection>

      <Tabs>
        <TabButton
          isActive={activeTab === "not called"}
          onClick={() => handleTabChange("not called")}
        >
          Not Called
        </TabButton>
        <TabButton
          isActive={activeTab === "called"}
          onClick={() => handleTabChange("called")}
        >
          Called
        </TabButton>
        <TabButton
          isActive={activeTab === "installed"}
          onClick={() => handleTabChange("installed")}
        >
          Installed
        </TabButton>
        <TabButton
          isActive={activeTab === "annulled"}
          onClick={() => handleTabChange("annulled")}
        >
          Annulled
        </TabButton>
      </Tabs>

      <SalesSection>
        {/* Pass activeTab as a prop to the Sales component */}
        <Sales
          activeTab={activeTab}
          sales={sales}
          handleStateSwitch={handleStateSwitch}
        />
      </SalesSection>

      <AddSaleButton onClick={handleAddSale}>Add New Sale</AddSaleButton>
    </Container>
  );
};

export default Dashboard;
