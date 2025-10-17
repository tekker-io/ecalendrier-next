"use client";

import { sendEvent } from "@/lib/firebaseClient";
import EmailIcon from "@mui/icons-material/Email";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import StarIcon from "@mui/icons-material/Star";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./button";

export function TopBar() {
  return (
    <div className="mb-14 flex justify-between items-center flex-col md:flex-row">
      <Link href="/calendars">
        <Image src="/logo.svg" alt="logo" width="212" height="59" />
      </Link>
      <div className="flex flex-wrap items-center justify-center text-white mt-4 md:mt-0">
        <a href="https://github.com/tekker-io/ecalendrier-next" target="_blank">
          <div className="mr-2">
            <Button size="small">
              <Image alt="GitHub" width="23" height="23" src="/github.svg" />
            </Button>
          </div>
        </a>
        <a
          href="https://www.facebook.com/ECalendrier-de-lavent-108201144469459"
          target="_blank"
        >
          <Button size="small">
            <FacebookRoundedIcon />
          </Button>
        </a>
        <Link
          href="https://www.facebook.com/messages/t/108201144469459"
          target="_blank"
          onClick={() => sendEvent("Click on contact")}
        >
          <div className="mr-2">
            <Button>
              Contacter
              <EmailIcon />
            </Button>
          </div>
        </Link>
        <Link
          href="/premium"
          className="bg-red rounded py-2 px-4 lg:py-4 flex items-center gap-2"
          onClick={() => sendEvent("Click on premium")}
        >
          <StarIcon />
          Mode premium
        </Link>
      </div>
    </div>
  );
}
