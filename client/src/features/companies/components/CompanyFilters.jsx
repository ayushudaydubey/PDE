const CompanyFilters = () => {
  return (
    <div className="flex gap-3">
      <select className="border p-3 rounded-lg">
        <option>Industry</option>
      </select>

      <select className="border p-3 rounded-lg">
        <option>City</option>
      </select>
    </div>
  );
};

export default CompanyFilters;