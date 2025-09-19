"use client";

import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Moon, Settings, Sun, TruckIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";
import { useRouter } from "next/navigation";
export const UserButton = ({ user }: Session) => {
  const router = useRouter();
  const { theme, systemTheme, setTheme } = useTheme();
  const [checked, setChecked] = useState(false);
  function setSwitchState() {
    switch (theme) {
      case "dark":
        return setChecked(true);
      case "light":
        return setChecked(false);
      case "system":
        return setChecked(false);
    }
  }
  useEffect(() => {
    if (theme === "system") {
      setChecked(systemTheme === "dark");
    } else {
      setChecked(theme === "dark");
    }
  }, [theme, systemTheme]);
  if (user)
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <Avatar className="w-12 h-12">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name ?? "User"} />
            ) : (
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase() ?? "?"}
              </AvatarFallback>
            )}
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-6 " align="end">
          <div className="mb-4 p-4 flex flex-col gap-1 items-center rounded-lg bg-primary/10 ">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name!}
                width={36}
                height={36}
                className="rounded-full"
              />
            )}
            <p className="font-bold text-xs">{user.name}</p>
            <span className="text-xs font-medium text-secondary-foreground">
              {user.email}
            </span>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/orders")}
            className=" group py-2 font-medium cursor-pointer transition-all duration-200"
          >
            <TruckIcon
              size={14}
              className="mr-3  group-hover:translate-x-1 transition-all duration-300 ease-in-out"
            />
            My orders
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/settings")}
            className=" group py-2 font-medium cursor-pointer transition-all duration-200"
          >
            <Settings
              size={14}
              className="mr-3  group-hover:rotate-180 transition-all duration-300 ease-in-out"
            />
            Settings
          </DropdownMenuItem>
          {theme && (
            <DropdownMenuItem className="flex items-center py-2 px-2 font-medium cursor-pointer transition-all duration-200">
              <div
                className="flex items-center w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  const newChecked = !checked;
                  setChecked(newChecked);
                  setTheme(newChecked ? "dark" : "light");
                }}
              >
                <div className="relative flex items-center justify-center w-4 h-4 mr-3">
                  <Sun
                    className="absolute group-hover:text-yellow-600 group-hover:rotate-180 dark:scale-0 dark:-rotate-90 transition-all duration-300 ease-in-out"
                    size={14}
                  />
                  <Moon
                    className="scale-0 dark:scale-100 group-hover:text-blue-400 transition-all duration-300 ease-in-out"
                    size={14}
                  />
                </div>

                <span className="dark:text-blue-400 text-secondary-foreground/75 text-sm font-medium leading-none">
                  {theme[0].toUpperCase() + theme?.slice(1)} mode
                </span>

                <Switch
                  className="ml-auto scale-90 pointer-events-none"
                  checked={checked}
                  onCheckedChange={() => {}}
                />
              </div>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="py-2 focus:bg-destructive/25 font-medium group cursor-pointer transition-all duration-200"
            onClick={() => signOut()}
          >
            <LogOut
              size={14}
              className="mr-3  group-hover:scale-75 transition-all duration-300 ease-in-out"
            />{" "}
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
};
