import { useState } from "react";
import TECHNOLOGIES from "./Technologies";
import { X } from "lucide-react";

export default function TechnologyMultiSelect({ value, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = TECHNOLOGIES.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50); // 🚀 limit results for performance

  const toggleSelect = (item) => {
    const exists = value.find((v) => v.value === item.value);

    if (exists) {
      onChange(value.filter((v) => v.value !== item.value));
    } else {
      onChange([...value, item]);
    }
  };

  return (
    <div className="relative">
      {/* Selected Tags */}
      <div
        onClick={() => setOpen(true)}
        className="min-h-[42px] flex flex-wrap gap-1.5 items-center p-2 rounded-xl border border-gray-200 bg-gray-50 cursor-text"
      >
        {value.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[11px] font-[600]"
          >
            {item.label}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(value.filter((v) => v.value !== item.value));
              }}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}

        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          placeholder="Search technologies..."
          className="flex-1 min-w-[120px] bg-transparent outline-none text-[12px]"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const selected = value.some((v) => v.value === item.value);

              return (
                <div
                  key={item.value}
                  onClick={() => toggleSelect(item)}
                  className={`px-3 py-2 text-[13px] cursor-pointer hover:bg-gray-100 flex justify-between ${
                    selected ? "bg-violet-50 text-violet-700" : ""
                  }`}
                >
                  {item.label}
                  {selected && "✓"}
                </div>
              );
            })
          ) : (
            <div className="px-3 py-2 text-gray-400 text-sm">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
