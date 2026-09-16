/**
 * Formateador automático de teléfonos para El Salvador (CHUMPATIN XXL)
 * Formato oficial: 8 dígitos numéricos con guión tras el 4to dígito (XXXX-XXXX)
 * El usuario no necesita ingresar el guión manualmente.
 */
export const formatElSalvadorPhone = (val) => {
  if (!val) return "";
  let digits = String(val).replace(/\D/g, "");

  // Si pegan número con código internacional de El Salvador (+503)
  if (digits.startsWith("503") && digits.length > 8) {
    digits = digits.slice(3);
  }

  // Límite estricto de 8 números
  digits = digits.slice(0, 8);

  if (digits.length <= 4) {
    return digits;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};
