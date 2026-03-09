"use client";

import React from "react";
import { ClipLoader } from "react-spinners";

const override = {
  display: "block",
  margin: "0 auto",
};

const Spinner = ({ loading }) => {
  return (
    <div className="flex justify-center items-center py-4">
      <ClipLoader
        color="#000000"
        loading={loading}
        cssOverride={override}
        size={40}
      />
    </div>
  );
};

export default Spinner;