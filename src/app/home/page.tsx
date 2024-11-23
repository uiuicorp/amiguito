"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (!session) {
    router.push("/");
    return null;
  }

  const handleCreateClick = () => {
    router.push("/create");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">
        Amigo Secreto {session ? `- Bem-vindo, ${session.user?.name}` : ""}
      </h1>
      <button
        className="p-2 bg-green-500 text-white rounded mb-8"
        onClick={handleCreateClick}
      >
        Criar Amigo Secreto
      </button>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Participando</h2>
        <ul className="list-disc pl-5">
          {/* Lista de amigos secretos */}
          <li>Amigo Secreto 1</li>
          <li>Amigo Secreto 2</li>
          <li>Amigo Secreto 3</li>
        </ul>
      </div>
    </div>
  );
}
