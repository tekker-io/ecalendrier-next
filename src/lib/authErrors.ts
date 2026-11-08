export function getAuthErrorMessage(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";
  switch (code) {
    case "auth/invalid-email":
      return "Cette adresse email n'est pas valide.";
    case "auth/quota-exceeded":
    case "auth/too-many-requests":
      return "Trop de demandes pour le moment, réessayez un peu plus tard.";
    case "auth/invalid-action-code":
    case "auth/expired-action-code":
      return "Ce lien de connexion a expiré ou a déjà été utilisé.";
    case "auth/network-request-failed":
      return "Problème de connexion internet, réessayez.";
    default:
      return "Une erreur est survenue, réessayez.";
  }
}
