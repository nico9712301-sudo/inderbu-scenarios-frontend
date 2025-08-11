import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Home,
  Loader2,
  LogIn,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { ResendConfirmationForm } from "@/presentation/features/confirm/components/organisms/resend-confirmation-form";
import { Button } from "@/shared/ui/button";
import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

interface ConfirmPageProps {
  searchParams: {
    token?: string;
    view?: string;
    email?: string;
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const { token, view, email } = searchParams;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-white from-slate-50 to-slate-100">
      <div className="mb-8 text-center">
        <Link href={"/"}>
          <Image
            src="https://inderbu.gov.co/wp-content/uploads/2024/07/LOGO-3.png"
            alt="INDERBU Logo"
            width={300}
            height={60}
            style={{
              height: "auto",
              objectFit: "contain",
            }}
          />
        </Link>
        <h3 className="text-lg text-muted-foreground font-bold mt-3">
          {view === "resend"
            ? "Reenvío de confirmación"
            : view === "success"
              ? "¡Correo enviado!"
              : "Verificación de cuenta"}
        </h3>
      </div>

      {view === "resend" ? (
        <ResendConfirmationForm initialEmail={email} />
      ) : view === "success" ? (
        <ResendConfirmationSuccess />
      ) : (
        <Suspense fallback={<LoadingState />}>
          <TokenVerificationContent token={token} />
        </Suspense>
      )}
    </main>
  );
}

function ResendConfirmationSuccess() {
  return (
    <Card className="w-full max-w-md border-2 border-green-100 bg-green-50 shadow-lg">
      <CardHeader className="flex flex-col items-center text-center pb-2">
        <div className="mb-4">
          <CheckCircle2 className="h-12 w-12 text-success" />
        </div>
        <CardTitle className="text-xl font-bold">¡Correo enviado!</CardTitle>
        <CardDescription className="text-center mt-2">
          Hemos enviado un nuevo enlace de confirmación a tu correo electrónico.
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center text-sm text-muted-foreground">
        <p>Revisa tu bandeja de entrada.</p>
        <p className="mt-2">Si no lo ves, comprueba la carpeta de spam.</p>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2">
        <Link
          href="/"
          className="text-xs text-center text-muted-foreground hover:underline mt-2 inline-flex items-center justify-center"
        >
          Ir al inicio <Home className="ml-1 h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}

function TokenVerificationContent({ token }: { token?: string }) {
  if (!token) {
    return (
      <TokenMessage
        status="invalid"
        title="Token no encontrado"
        message="No se ha proporcionado un token de confirmación válido en la URL."
        icon={<XCircle className="h-12 w-12 text-destructive" />}
        primaryAction={{
          href: "/confirm?view=resend",
          label: "Solicitar nuevo token",
          icon: <RefreshCw className="h-4 w-4 mr-2" />,
        }}
      />
    );
  }

  return <TokenVerifier token={token} />;
}

async function TokenVerifier({ token }: { token: string }) {
  let status: "success" | "expired" | "invalid";
  let message: string;

  try {
    const res = await fetch(
      `http://localhost:3001/users/confirm?token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );

    if (res.ok) {
      status = "success";
      const body = await res.json();
      message = body.data?.message ?? "¡Cuenta activada con éxito!";
    } else {
      const err = await res.json();
      status = err.message === "El token ha expirado" ? "expired" : "invalid";
      message = err.message;
    }
  } catch {
    status = "invalid";
    message =
      "Error al conectar con el servidor. Por favor, inténtalo de nuevo más tarde.";
  }

  if (status === "success") {
    return (
      <TokenMessage
        status="success"
        title="¡Cuenta confirmada!"
        message={message}
        icon={<CheckCircle2 className="h-12 w-12 text-success" />}
      />
    );
  }

  if (status === "expired") {
    return (
      <TokenMessage
        status="expired"
        title="Token expirado"
        message={message}
        icon={<Clock className="h-12 w-12 text-amber-500" />}
        primaryAction={{
          href: "/confirm?view=resend",
          label: "Solicitar nuevo token",
          icon: <RefreshCw className="h-4 w-4 mr-2" />,
        }}
      />
    );
  }

  return (
    <TokenMessage
      status="invalid"
      title="Token inválido"
      message={message}
      icon={<XCircle className="h-12 w-12 text-destructive" />}
      primaryAction={{
        href: "/confirm?view=resend",
        label: "Solicitar nuevo token",
        icon: <RefreshCw className="h-4 w-4 mr-2" />,
      }}
      secondaryAction={{
        href: "/help",
        label: "Necesito ayuda",
      }}
    />
  );
}

interface ActionProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface TokenMessageProps {
  status: "success" | "expired" | "invalid";
  title: string;
  message: string;
  icon: React.ReactNode;
  primaryAction?: ActionProps;
  secondaryAction?: ActionProps;
}

function TokenMessage({
  status,
  title,
  message,
  icon,
  primaryAction,
}: TokenMessageProps) {
  const statusColors = {
    success: "border-green-100 bg-green-50",
    expired: "border-amber-100 bg-amber-50",
    invalid: "border-red-100 bg-red-50",
  };

  return (
    <Card
      className={`w-full max-w-md border-2 shadow-lg ${statusColors[status]}`}
    >
      <CardHeader className="flex flex-col items-center text-center pb-2">
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription className="text-center mt-2 text-sm">
          {message}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center text-sm text-muted-foreground">
        {status === "success" && <p>Ya puedes acceder a la plataforma.</p>}
        {status === "expired" && (
          <p>Los enlaces duran 24 horas. Solicita uno nuevo.</p>
        )}
        {status === "invalid" && (
          <p>El enlace no es válido. Solicita uno nuevo.</p>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2">
        {primaryAction && (
          <Button className="w-full" asChild>
            <Link href={primaryAction.href}>
              {primaryAction.icon}
              {primaryAction.label}
            </Link>
          </Button>
        )}

        <Link
          href="/"
          className="text-xs text-center text-muted-foreground hover:underline mt-2 inline-flex items-center justify-center"
        >
          Volver al inicio <ArrowLeft className="ml-1 h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}

function LoadingState() {
  return (
    <Card className="w-full max-w-md border shadow-lg">
      <CardHeader className="flex flex-col items-center text-center pb-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <CardTitle className="mt-4 text-xl font-bold">
          Verificando token...
        </CardTitle>
        <CardDescription className="text-center mt-2">
          Espera un momento, por favor.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
