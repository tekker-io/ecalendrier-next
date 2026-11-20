"use client";

import { useAuth } from "@/context/AuthProvider";
import { sendEvent } from "@/lib/firebaseClient";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import StarIcon from "@mui/icons-material/Star";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const FACEBOOK_URL =
  "https://www.facebook.com/ECalendrier-de-lavent-108201144469459";
const CONTACT_URL = "https://www.facebook.com/messages/t/108201144469459";

function useLogout() {
  const { signOut } = useAuth();
  const router = useRouter();
  return async () => {
    await signOut();
    router.push("/");
  };
}

function PremiumLink({
  large = false,
  onClick,
}: {
  large?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/premium"
      onClick={() => {
        sendEvent("Click on premium");
        onClick?.();
      }}
      className={`bg-red text-white rounded flex items-center gap-2 font-bold ${
        large ? "px-3 py-3 text-lg mt-2" : "py-2 px-4"
      }`}
    >
      <StarIcon />
      Mode premium
    </Link>
  );
}

/**
 * Read on the server by each page: known from the first render, unlike the
 * client Firebase auth state that loads after a reload
 */
export type TopBarAccount = { email: string | null; premium: boolean } | null;

function useNav(account: TopBarAccount) {
  const pathname = usePathname();
  return {
    loggedIn: !!account,
    premium: !!account?.premium,
    onCalendars: pathname === "/calendars" || pathname.startsWith("/edit/"),
  };
}

/** Account icon with a dropdown: email, contact, Facebook, logout */
function AccountMenu({
  email,
  premium,
}: {
  email: string | null;
  premium: boolean;
}) {
  const logout = useLogout();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = () => setAnchor(null);

  return (
    <>
      <Tooltip title="Mon compte">
        <IconButton
          aria-label="Mon compte"
          onClick={(e) => setAnchor(e.currentTarget)}
          className="!text-white"
        >
          <AccountCircleIcon fontSize="large" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {email && (
          <p className="px-4 pt-1 pb-2 text-sm text-gray-600 max-w-64 truncate">
            Connecté avec {email}
          </p>
        )}
        {premium && (
          <MenuItem
            component={Link}
            href="/premium"
            onClick={() => {
              sendEvent("Click on premium");
              close();
            }}
          >
            <ListItemIcon>
              <StarIcon fontSize="small" className="text-yellow-500" />
            </ListItemIcon>
            Mode premium
          </MenuItem>
        )}
        <MenuItem
          component="a"
          href={CONTACT_URL}
          target="_blank"
          onClick={() => {
            sendEvent("Click on contact");
            close();
          }}
        >
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          Contacter
        </MenuItem>
        <MenuItem
          component="a"
          href={FACEBOOK_URL}
          target="_blank"
          onClick={close}
        >
          <ListItemIcon>
            <FacebookRoundedIcon fontSize="small" />
          </ListItemIcon>
          Page Facebook
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            close();
            logout();
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Déconnexion
        </MenuItem>
      </Menu>
    </>
  );
}

/** Premium users keep the premium page in the account menu instead */
function DesktopNav({ account }: { account: TopBarAccount }) {
  const { loggedIn, premium, onCalendars } = useNav(account);
  const item = "flex items-center gap-1 rounded px-3 py-2 hover:bg-black/10";
  return (
    <div className="hidden lg:flex items-center gap-2 text-white">
      {loggedIn ? (
        <Link
          href="/calendars"
          className={`${item} ${onCalendars ? "font-bold underline underline-offset-4" : ""}`}
        >
          <CalendarMonthIcon />
          Mes calendriers
        </Link>
      ) : (
        <Link
          href={CONTACT_URL}
          target="_blank"
          onClick={() => sendEvent("Click on contact")}
          className={item}
        >
          <EmailIcon />
          Contacter
        </Link>
      )}
      {!(loggedIn && premium) && <PremiumLink />}
      {account && (
        <AccountMenu email={account.email} premium={account.premium} />
      )}
    </div>
  );
}

function DrawerNav({
  account,
  onNavigate,
}: {
  account: TopBarAccount;
  onNavigate: () => void;
}) {
  const { loggedIn, premium, onCalendars } = useNav(account);
  const logout = useLogout();
  const item =
    "flex items-center gap-3 rounded px-3 py-3 text-lg hover:bg-black/5";
  return (
    <>
      {account?.email && (
        <p className="px-3 pb-3 mb-2 text-sm text-gray-600 border-b border-gray-200 truncate">
          Connecté avec {account.email}
        </p>
      )}
      {loggedIn && (
        <Link
          href="/calendars"
          onClick={onNavigate}
          className={`${item} ${onCalendars ? "font-bold" : ""}`}
        >
          <CalendarMonthIcon />
          Mes calendriers
        </Link>
      )}
      <Link
        href={CONTACT_URL}
        target="_blank"
        onClick={() => {
          sendEvent("Click on contact");
          onNavigate();
        }}
        className={item}
      >
        <EmailIcon />
        Contacter
      </Link>
      <a
        href={FACEBOOK_URL}
        target="_blank"
        onClick={onNavigate}
        className={item}
      >
        <FacebookRoundedIcon />
        Page Facebook
      </a>
      {loggedIn && premium ? (
        <Link
          href="/premium"
          onClick={() => {
            sendEvent("Click on premium");
            onNavigate();
          }}
          className={item}
        >
          <StarIcon className="text-yellow-500" />
          Mode premium
        </Link>
      ) : (
        <PremiumLink large onClick={onNavigate} />
      )}
      {loggedIn && (
        <button
          type="button"
          onClick={() => {
            onNavigate();
            logout();
          }}
          className={`${item} cursor-pointer mt-auto`}
        >
          <LogoutIcon />
          Déconnexion
        </button>
      )}
    </>
  );
}

export function TopBar({ account }: { account: TopBarAccount }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <nav className="mb-10 sm:mb-14 flex justify-between items-center gap-4">
      <Link href={account ? "/calendars" : "/"} className="shrink-0">
        <Image
          src="/logo.svg"
          alt="Case du jour"
          width="212"
          height="59"
          className="w-40 sm:w-[212px] h-auto"
        />
      </Link>

      <DesktopNav account={account} />

      {/* Mobile and tablet */}
      <IconButton
        aria-label="Ouvrir le menu"
        onClick={() => setDrawerOpen(true)}
        className="lg:!hidden !text-white"
      >
        <MenuIcon fontSize="large" />
      </IconButton>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <div className="w-72 max-w-[85vw] h-full flex flex-col gap-1 p-4 text-black">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-lg">Menu</span>
            <IconButton
              aria-label="Fermer le menu"
              onClick={() => setDrawerOpen(false)}
            >
              <CloseIcon />
            </IconButton>
          </div>
          <DrawerNav
            account={account}
            onNavigate={() => setDrawerOpen(false)}
          />
        </div>
      </Drawer>
    </nav>
  );
}
