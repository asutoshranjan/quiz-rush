"use client";

function capitalizeFirstLetter(value: string) {
  return value
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function PayoutHistory({
  loading,
  data,
}: {
  loading: boolean;
  data: any;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 pb-16 mt-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl z-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Payout History
        </h2>

        {!loading && (
          <div className="mt-2 mb-4 text-sm text-gray-600">
            <p>Total Transactions: {data?.total || 0}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500 border-solid"></div>
            <p className="ml-4 text-gray-600">Loading...</p>
          </div>
        ) : data && data.transactions ? (
          data.transactions.length > 0 ? (
            <div className="space-y-4">
              {data.transactions.map((transaction: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-100"
                >
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Txn Signature:
                    </p>
                    <p className="text-gray-800 break-all">
                      {transaction.txnSignature}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Amount:</span>{" "}
                      {transaction.amount / 1000_000_000} SOL
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status: </span>
                      <span
                        className={`${
                          transaction.status == "paid" ? "text-green-600" : transaction.status == "success verified" ? "text-green-700 font-bold font-inter" : "text-red-600"
                        }`}
                      >
                        {capitalizeFirstLetter(transaction.status)}
                      </span>
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Updated at:{" "}
                    {new Date(transaction.updatedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No transactions found.</p>
          )
        ) : (
          <p className="text-gray-600">No transactions found.</p>
        )}
      </div>
    </div>
  );
}
