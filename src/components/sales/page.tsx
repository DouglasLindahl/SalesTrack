"use client";

import styled from "styled-components";

// Styled Components
const SalesList = styled.div`
  background-color: #202020;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SaleItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background-color: #303030;
`;

const SaleText = styled.p`
  font-size: 1rem;
  color: white;
  margin: 0;
`;

const CallIcon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

const StateContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
`;

const StateSquare = styled.div<{ color: string }>`
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${(props) => props.color};
`;

interface Sale {
  id: string;
  name: string;
  status: string;
  install_date: string;
  created_at: string;
  number: string;
}

interface SalesProps {
  activeTab: string;
  sales: Sale[]; // Replace 'any[]' with 'Sale[]'
  handleStateSwitch: (saleId: string, newStatus: string) => void;
}

const Sales = ({ activeTab, sales, handleStateSwitch }: SalesProps) => {
  // Mapping colors based on status
  const statusColor: { [key: string]: string } = {
    "not called": "orange",
    called: "yellow",
    installed: "green",
    annulled: "red",
  };

  // Filter sales based on activeTab, always display "annulled" sales when activeTab is "annulled"
  const filteredSales = sales
    .filter((sale) => activeTab === "all" || sale.status === activeTab)
    // Sort the sales by created_at in descending order
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return (
    <SalesList>
      {filteredSales.map((sale) => (
        <SaleItem key={sale.id}>
          <div>
            <SaleText>
              <strong>{sale.name}</strong>
            </SaleText>
            <SaleText>
              {new Date(sale.install_date).toLocaleDateString()}
            </SaleText>
          </div>

          <StateContainer>
            <StateSquare
              color={statusColor["not called"]}
              onClick={() => handleStateSwitch(sale.id, "not called")}
            />
            <StateSquare
              color={statusColor["called"]}
              onClick={() => handleStateSwitch(sale.id, "called")}
            />
            <StateSquare
              color={statusColor["installed"]}
              onClick={() => handleStateSwitch(sale.id, "installed")}
            />
            <StateSquare
              color={statusColor["annulled"]}
              onClick={() => handleStateSwitch(sale.id, "annulled")}
            />
          </StateContainer>
          <CallIcon
            src="/call.png"
            alt="Call"
            onClick={() => (window.location.href = `tel:${sale.number}`)}
          />
        </SaleItem>
      ))}
    </SalesList>
  );
};

export default Sales;
