import React, { useState } from "react";
import useCreateTag from "../hooks/useCreateTag";

const TagForm = () => {
  const [name, setName] = useState("");

  const { mutate, isPending } = useCreateTag();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name) return;

    mutate(
      { name },
      {
        onSuccess: () => {
          setName("");
        },
      }
    );
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">
        Create Tag
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          type="text"
          placeholder="Enter tag name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="w-full border p-3 rounded-lg"
        />

        <button
          type="submit"
          disabled={isPending}
          className="bg-black text-white px-5 py-2 rounded-lg"
        >
          {isPending
            ? "Creating..."
            : "Create Tag"}
        </button>
      </form>
    </div>
  );
};

export default TagForm;