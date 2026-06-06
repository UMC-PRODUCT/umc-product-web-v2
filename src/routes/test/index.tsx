import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/test/")({
  component: TestIndexPage,
})

const modules = import.meta.glob("./*.tsx")
const pages = Object.keys(modules)
  .map((path) => path.slice(2, -4))
  .filter((name) => name !== "index" && name !== "route")
  .sort()

function TestIndexPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-2">
        Test Pages
      </h1>
      <p className="text-body-2-medium text-teal-gray-500 mb-8">
        총 {pages.length}개
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {pages.map((name) => (
          <li key={name}>
            <a
              href={`/test/${name}`}
              className="text-body-2-medium text-teal-gray-700 border-teal-gray-200 block rounded-lg border bg-white px-4 py-3 transition-colors hover:border-teal-500 hover:text-teal-600"
            >
              {name}
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
