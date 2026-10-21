const CompanySearch = ({
  search,
  setSearch,
}) => {
  return (
    <input
      type="text"
      placeholder="Search company..."
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
      className="border p-3 rounded-lg w-full"
    />
  );
};

export default CompanySearch;