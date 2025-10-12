import Header from "@/components/snapcut/header";
import Editor from "@/components/snapcut/editor";
import Footer from "@/components/snapcut/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <Editor />
      </main>
      <Footer />
    </div>
  );
}
