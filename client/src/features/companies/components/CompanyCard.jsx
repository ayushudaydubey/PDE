const CompanyCard = ({ company }) => {
  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h2 className="text-xl font-bold">
        {company.company_name}
      </h2>

      <p>{company.industry}</p>

      <p>{company.city}</p>

      <p>{company.email}</p>
    </div>
  );
};

export default CompanyCard;