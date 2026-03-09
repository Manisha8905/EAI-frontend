"use client"
import react from "react";
import { useState } from "react";

export default function Setting() {
  const [connectionType, setConnectionType] = useState("SMTP");
  const [emailPlatform, setEmailPlatform] = useState("SMTP");
  const [smtpProvider, setSmtpProvider] = useState("Mailgun");
  const [crmConnected, setCrmConnected] = useState(true);

  const [agents, setAgents] = useState([
    { id: 1, name: "David", email: "techmindzdev@gmail.com", active: false },
    { id: 2, name: "Mike", email: "techmindzdev@gmail.com", active: false },
    { id: 3, name: "Test 1", email: "techmindzdev@gmail.com", active: false },
    { id: 4, name: "Shreyas", email: "techmindzdev@gmail.com", active: true }
  ]);

  const switchAgent = (id) => {
    const updatedAgents = agents.map((agent) => ({
      ...agent,
      active: agent.id === id
    }));
    setAgents(updatedAgents);
  };

  return (
    <>
  
      <div className="p-8 bg-gray-100 min-h-screen">

      <h1 className="text-xl font-semibold mb-6 text-black">Settings</h1>

      <div className="grid grid-cols-3 gap-5">

        {/* Configure CRM */}
        {emailPlatform === "CRM" && (
          <div className="bg-white border rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium text-black">Configure CRM</span>

            {crmConnected ? (
              <button
                onClick={() => setCrmConnected(false)}
                className="bg-red-500 text-white px-4 py-1 rounded"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => setCrmConnected(true)}
                className="bg-green-500 text-white px-4 py-1 rounded"
              >
                Connect
              </button>
            )}
          </div>
        )}

        {/* Agent */}
        <div className="bg-white border rounded-lg p-4 flex justify-between items-center">
          <span className="font-medium text-black">Agent</span>
          <button className="border px-3 py-1 rounded hover:bg-gray-100 text-black">
            ⚙
          </button>
        </div>

        {/* Mapping */}
        {emailPlatform === "CRM" && (
          <div className="bg-white border rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium text-black">Mappings</span>
            <button className="border px-3 py-1 rounded  hover:bg-gray-100 text-black">
              ⚙
            </button>
          </div>
        )}

        {/* Email Sender Platform */}
        <div className="bg-white border rounded-lg p-4 flex justify-between items-center">
          <span className="font-medium text-black">Email Sender Platform</span>

          <select
            value={emailPlatform}
            onChange={(e) => setEmailPlatform(e.target.value)}
            className="border rounded px-3 py-1 text-black"
          >
            <option value="SMTP">SMTP</option>
            <option value="CRM">CRM</option>
          </select>
        </div>

        {/* Email Templates */}
        <div className="bg-white border rounded-lg p-4 flex justify-between items-center">
          <span className="font-medium text-black">Email Templates</span>
          <button className="border px-3 py-1 rounded hover:bg-gray-100 text-black">
            ⚙
          </button>
        </div>

        {/* SMTP Provider */}
        {emailPlatform === "SMTP" && (
          <div className="bg-white border rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium text-black">Default SMTP Provider</span>

            <select
              value={smtpProvider}
              onChange={(e) => setSmtpProvider(e.target.value)}
              className="border rounded px-3 py-1 text-black"
            >
              <option>Mailgun</option>
              <option>SendGrid</option>
              <option>Amazon SES</option>
            </select>
          </div>
        )}

        {/* SMTP Configuration */}
        {emailPlatform === "SMTP" && (
          <div className="bg-white border rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium text-black">
              SMTP Providers Configuration
            </span>
            <button className="border px-3 py-1 rounded text-black hover:bg-gray-100 ">
              ⚙
            </button>
          </div>
        )}

        {/* Graph Configuration */}
        {emailPlatform === "CRM" && (
          <div className="bg-white border rounded-lg p-4 flex justify-between items-center">
            <span className="font-medium text-black">Graph Configuration</span>
            <button className="border px-3 py-1 rounded text-black hover:bg-gray-100">
              ⚙
            </button>
          </div>
        )}

      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">

          {/* Dropdown */}
          <select
            value={connectionType}
            onChange={(e) => setConnectionType(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-white shadow-sm"
          >
            <option value="SMTP">SMTP</option>
            <option value="CRM">CRM</option>
          </select>

          <button className="border px-4 py-2 rounded-lg bg-white hover:bg-gray-100">
            Mapping
          </button>

          <button className="border px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50">
            Configure CRM 
          </button>

          <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
            + Create New Agent
          </button>

        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full">

          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Agent Name</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Email</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-600">Action</th>
            </tr>
          </thead>

          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id} className="border-t">

                <td className="px-6 py-4">{agent.name}</td>

                <td className="px-6 py-4 text-blue-600">
                  {agent.email}
                </td>

                <td className="px-6 py-4">
                  {agent.active ? (
                    <button className="px-4 py-1.5 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed">
                      Active
                    </button>
                  ) : (
                    <button
                      onClick={() => switchAgent(agent.id)}
                      className="px-4 py-1.5 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-50"
                    >
                      Switch
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>

        </table>

        <div className="text-center text-sm text-gray-500 py-3 border-t">
          {agents.length} results
        </div>
      </div>


  

\
    </div>
      </>
  );
}