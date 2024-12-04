import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { useLocalStorage } from "usehooks-ts";

type Message = {
  type: "query" | "response";
  content: string;
};

const apiCall = async (query: string) => {
  try {
    const { data } = await axios.post(`http://localhost:3000/query`, { query });
    console.log(typeof data.answer);
    console.log(data.answer);

    return data.answer;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch data");
  }
};

export default function QueryForm() {
  const [query, setQuery] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]); // Store messages
  const [error, setError] = useState<string | null>(null);
  const [previousConversations, setPreviousConversations] = useLocalStorage<
    Message[]
  >("previousConversations", []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleQuerySubmit = async () => {
    if (!query.trim()) return; // Prevent empty queries

    setIsLoading(true);
    setError(null);

    const newMessage: Message = { type: "query", content: query };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await apiCall(query);

      const responseMessage: Message = { type: "response", content: response };
      setMessages((prev) => [...prev, responseMessage]);

      // Save the conversation
      setPreviousConversations((prev) => [
        ...prev,
        ...[newMessage, responseMessage],
      ]);
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }

    setQuery(""); // Clear the input after submission
    scrollToBottom();
  };

  useEffect(() => {
    if (previousConversations && previousConversations.length > 0) {
      setMessages(previousConversations);
      scrollToBottom();
    }
  }, [previousConversations]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuerySubmit();
    }
  };

  return (
    <div style={{ height: "90vh", overflowY: "auto" }}>
      <div className="flex flex-col items-center w-full p-10">
        <h1 className="text-2xl font-bold mb-4">Chatbot Interface</h1>

        {/* Displaying messages */}
        <div className="mt-6 w-full max-w-2xl space-y-4 mb-24">
          <div className="space-y-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "query" ? "justify-end" : "justify-start"
                }`}
              >
                <Card
                  className={`p-4 max-w-[75%] rounded-lg ${
                    message.type === "query"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {message.type === "response" ? (
                    <div
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </Card>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat input bar fixed at the bottom */}
        <div className="w-full max-w-4xl flex gap-4 justify-around items-center fixed bottom-10 bg-white z-10">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress} // Handle Enter key press
            placeholder="Enter your query..."
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleQuerySubmit}
            disabled={isLoading}
            className="w-auto"
          >
            Submit
          </Button>
        </div>

        {error && <div className="text-red-500 mt-4">{error}</div>}
        {isLoading && <div className="text-blue-500 mt-4">Loading...</div>}
      </div>
    </div>
  );
}
