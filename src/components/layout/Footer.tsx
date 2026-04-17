export default function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-500 flex justify-between">
        <span>© {new Date().getFullYear()} Levamen Tech</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
}