"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useState } from "react";


interface Props {
  initialEmail?: string;
}

export function ResendConfirmationForm({ initialEmail }: Props) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:3001/users/resend-confirmation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (!res.ok) {
        const body = await res.json();
        setError(body.message || "Error enviando el correo");
      } else {
        // redirigimos a la misma página en modo success
        router.push(`/confirm?view=success&email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError("Error de conexión, inténtalo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">
          Solicitar nuevo enlace
        </CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico para recibir un nuevo enlace de
          confirmación
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Enviando..." : "Enviar enlace de confirmación"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center pt-2">
        <Button variant="link" asChild>
          <a href="/login">Volver a inicio de sesión</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
