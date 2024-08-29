import { toast } from "sonner";

export default function Toast({
  type,
  message,
  check = false,
}: {
  type: string;
  message: string;
  check?: boolean;
}) {
  toast.custom((t) => (
    <div
      className={`w-96 bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5"></div>
          <div className="ml-3 flex-1">
            <p
              className={`text-lg font-medium font-Inter ${
                type.toLowerCase() === "error"
                  ? "text-red-500"
                  : check
                  ? "text-deep-green"
                  : "text-deep-black"
              }`}
            >
              {type}
            </p>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-1 hover:text-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  ));
}
