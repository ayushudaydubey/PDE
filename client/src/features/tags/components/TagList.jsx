import React from "react";
import useGetTags from "../hooks/useGetTags";
import useDeleteTag from "../hooks/useDeleteTag";

const TagList = () => {
  const { data, isLoading } = useGetTags();

  const { mutate } = useDeleteTag();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">
        Tags List
      </h2>

      <div className="space-y-3">
        {data?.map((tag) => (
          <div
            key={tag._id}
            className="flex items-center justify-between border p-3 rounded-lg"
          >
            <p>{tag.name}</p>

            <button
              onClick={() => mutate(tag._id)}
              className="bg-red-500 text-white px-4 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagList;