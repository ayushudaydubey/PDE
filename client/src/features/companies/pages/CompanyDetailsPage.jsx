import { useParams } from "react-router-dom";

import { useCompany } from "../hooks/useCompany";

const CompanyDetailsPage = () => {
  const { id } = useParams();

  const { data, isLoading } =
    useCompany(id);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h1 className="text-3xl font-bold mb-4">
        {data.company_name}
      </h1>

      <p>Industry: {data.industry}</p>

      <p>City: {data.city}</p>

      <p>Email: {data.email}</p>

      <p>Phone: {data.phone}</p>

      <p>Website: {data.website}</p>
    </div>
  );
};

export default CompanyDetailsPage;