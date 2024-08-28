"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Session = {
  quizSessionId: string;
  setTitle: string;
  startTime: string | null;
  endTime: string | null;
  totalPoints: number;
  ended: boolean;
  imageUrl: string | null;
};

export default function SessionDetails() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [page, setPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pastsessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: pageNumber,
        }),
      });
      const data = await res.json();
      setSessions(data.documents);
      setTotalDocuments(data.total);
      console.log(data.total);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(page);
  }, [page]);

  const handleNextPage = () => {
    if (page < Math.ceil(totalDocuments / 10)) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-deep-black">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        </div>
      )}
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Previous Sessions</h1>
      <div className="space-y-4 min-h-96">
        {sessions &&
          sessions.map((session) => (
            <div>
              <Link
                href={`/play/${session.quizSessionId}`}
                className="flex-1 w-full"
              >
                <div
                  key={session.quizSessionId}
                  className="relative p-4 border border-gray-200 rounded-lg shadow-sm bg-white flex flex-col justify-center items-start"
                >
                  {/* Background image with blur */}
                  { session.imageUrl && <div
                    className="absolute inset-0 bg-cover bg-center rounded-lg"
                    style={{
                      backgroundImage: `url(${session.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  /> }

                  {/* White overlay with transparency */}
                  <div className="absolute inset-0 bg-white opacity-95 rounded-lg"></div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h2 className="text-xl font-semibold">
                      {session.setTitle}
                    </h2>
                    <h2 className="text-sm font-medium mb-2">
                      Session Id: {session.quizSessionId}
                    </h2>
                    <p>
                      <strong>Start Time:</strong>{" "}
                      {session.startTime
                        ? new Date(session.startTime).toLocaleString()
                        : "Not Started"}
                    </p>
                    <p>
                      <strong>End Time:</strong>{" "}
                      {session.endTime
                        ? new Date(session.endTime).toLocaleString()
                        : "Not Ended"}
                    </p>
                    <p>
                      <strong>Total Points:</strong> {session.totalPoints}
                    </p>
                    <p className="font-medium">
                      <strong>Session Status:</strong>{" "}
                      <span
                        className={
                          session.ended
                            ? "text-green-600"
                            : session.startTime
                            ? "text-red-600"
                            : "text-yellow-600"
                        }
                      >
                        {session.ended
                          ? "Ended"
                          : session.startTime
                          ? "Response Rejected"
                          : "Waiting to Start"}
                      </span>
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
      </div>
      {totalDocuments === 0 || !totalDocuments ? (
        <div className="text-lg font-semibold text-center mt-6">
          No sessions found
        </div>
      ) : (
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className="px-4 py-2 bg-light-blue text-white font-semibold rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-lg font-semibold">
            Page {page} of {Math.ceil(totalDocuments / 10)}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page === Math.ceil(totalDocuments / 10)}
            className="px-4 py-2 bg-light-blue text-white font-semibold rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
