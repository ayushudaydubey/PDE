import { Link } from "react-router-dom";

const CompanyTable = ({ companies }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Name</th>

            <th className="p-3 text-left">
              Industry
            </th>

            <th className="p-3 text-left">City</th>

            <th className="p-3 text-left">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {companies?.map((company) => (
            <tr
              key={company._id}
              className="border-b"
            >
              <td className="p-3">
                {company.company_name}
              </td>

              <td className="p-3">
                {company.industry}
              </td>

              <td className="p-3">
                {company.city}
              </td>

              <td className="p-3">
                <Link
                  to={`/companies/${company._id}`}
                  className="text-blue-500"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyTable;