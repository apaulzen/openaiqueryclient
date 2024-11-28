import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { useLocalStorage } from "usehooks-ts";

function QueryCard({ data }: { data: any }) {
  return (
    <Card className="m-4 p-4 rounded-lg">
      <div className="space-y-2">
        {Object.keys(data).map((key) => (
          <div key={key} className="grid grid-cols-[1fr,3fr] gap-2">
            <span className="font-semibold text-gray-700">{key}:</span>
            <span className="text-gray-800 overflow-auto">{data[key]}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const apiCall = async (query: string) => {
  try {
    const { data } = await axios.post(`http://localhost:3000/query`, { query });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch data');
  }
};

export default function QueryForm() {
  const [query, setQuery] = useState<string>("");
  const [responseData, setResponseData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [previousQueries, setPreviousQueries] = useLocalStorage<any[]>("previousQueries", []);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleQuerySubmit = async () => {
    setIsLoading(true); 
    setError(null); 

    try {
      const response = await apiCall(query); 
      setResponseData(response);
      setPreviousQueries((prev) => [...prev, query]);
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setIsLoading(false); 
    }
  };

  const handleReset = () => {
    setQuery("");  // Reset the query input
    setResponseData([]);  // Clear the response data
    setError(null);  // Clear the error message
  };

  useEffect(() => {
    // Any side effects can go here
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-2xl font-bold mb-4">Natural Language Query</h1>
      <div className="w-full max-w-md mb-4 flex gap-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query..."
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={handleQuerySubmit} disabled={isLoading}>
          Submit Query
        </Button>
        <Button onClick={handleReset} className="bg-gray-500 hover:bg-gray-600" disabled={isLoading}>
          Reset
        </Button>
      </div>

      {error && <div className="text-red-500 mt-4">{error}</div>}

      {/* Display loading state */}
      {isLoading && <div className="text-blue-500 mt-4">Loading...</div>}

      <div className="mt-6 w-full">
        {responseData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {responseData.map((item, index) => (
              <QueryCard key={index} data={item} />
            ))}
          </div>
        )}

        {previousQueries.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Previous Queries</h2>
            <ul className="mt-2 space-y-2">
              {previousQueries.map((query, index) => (
                <li key={index} className="text-gray-700">{query}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
