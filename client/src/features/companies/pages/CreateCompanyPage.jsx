import { useState } from "react";

import { useCreateCompany } from "../hooks/useCreateCompany";

const CreateCompanyPage = () => {
  const { mutate, isPending } =
    useCreateCompany();

  const [formData, setFormData] =
    useState({
      company_name: "",
      industry: "",
      city: "",
      email: "",
    });

  const handleSubmit = (e) => {
    e.preventDefault();

    mutate(formData);
  };

  return (
    <div className="max-w-xl bg-white p-6 rounded-xl shadow">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          type="text"
          placeholder="Company Name"
          className="w-full border p-3 rounded"
          onChange={(e) =>
            setFormData({
              ...formData,
              company_name:
                e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Industry"
          className="w-full border p-3 rounded"
          onChange={(e) =>
            setFormData({
              ...formData,
              industry:
                e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="City"
          className="w-full border p-3 rounded"
          onChange={(e) =>
            setFormData({
              ...formData,
              city: e.target.value,
            })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded"
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
        />

        <button className="bg-black text-white px-5 py-3 rounded">
          {isPending
            ? "Creating..."
            : "Create Company"}
        </button>
      </form>
    </div>
  );
};

export default CreateCompanyPage;