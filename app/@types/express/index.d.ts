import { UserDocument } from "../../interfaces/user.interface";

// Dette er den riktige måten å utvide Express på
declare global {
  namespace Express {
    // Utvid User-typen fra Passport
    interface User extends UserDocument {
      id?: string;
      role?: string;
    }

    // Utvid Request-typen
    interface Request {
      user?: User; // Bruk den utvidede User-typen
    }
  }

  // Ikke re-deklarer Error-interfacet, da det er en global type
}
