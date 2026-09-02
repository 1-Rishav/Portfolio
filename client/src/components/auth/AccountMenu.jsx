"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { FiUser, FiChevronDown, FiLogOut } from "react-icons/fi";
import { LogOut } from "../../store/slices/authSlice";

/**
 * Replaces the old plain-text "Login" / "Logout" nav links with:
 *  - guest: a circular icon button that hands off to the caller (opens AuthModal)
 *  - logged in: an avatar + first-name pill that opens a small dropdown
 *    showing the account email and a Log out action
 *
 * Reads auth state directly from Redux, so it drops into both the desktop
 * nav and the mobile panel without either needing its own role/isLoggedIn
 * branching - that logic now lives in exactly one place.
 *
 * onRequestLogin: called when a guest clicks the icon button. The caller
 *   decides what "requesting login" means in its context (desktop: just open
 *   the modal; mobile: close the hamburger panel first, then open the modal).
 * onAfterLogout: called after logout completes, so the caller can replicate
 *   whatever else used to happen alongside it (e.g. navigating home).
 */
const AccountMenu = ({ onRequestLogin, onAfterLogout, className = "" }) => {
  const { isLoggedIn, firstName, email } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    // LogOut is an async thunk that awaits POST auth/logout before Redux
    // state actually updates - awaiting it here means onAfterLogout (which
    // often navigates) only fires once the logged-out state is real, rather
    // than a moment before it, which could briefly render the old logged-in
    // UI at the destination.
    await dispatch(LogOut());
    onAfterLogout?.();
  };

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={onRequestLogin}
        aria-label="Log in"
        className={`h-10 w-10 flex items-center justify-center rounded-full border border-black/10 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0 ${className}`}
      >
        <FiUser className="h-4 w-4" />
      </button>
    );
  }

  const initial = (firstName || "U").trim().charAt(0).toUpperCase();

  return (
    <div ref={wrapperRef} className={`relative flex-shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <span className="h-7 w-7 flex items-center justify-center rounded-full bg-emerald-300 text-black text-sm font-semibold flex-shrink-0">
          {initial}
        </span>
        <span className="text-sm font-medium text-black dark:text-white max-w-[7rem] truncate">
          {firstName || "Account"}
        </span>
        <FiChevronDown
          className={`h-3.5 w-3.5 text-black/50 dark:text-white/50 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute right-0 mt-2 w-56 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black shadow-xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 truncate border-b border-black/5 dark:border-white/10">
              {email}
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <FiLogOut className="h-4 w-4" />
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountMenu;
