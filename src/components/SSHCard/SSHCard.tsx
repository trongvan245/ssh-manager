import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Host } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { DialogClose } from "@radix-ui/react-dialog";
import { selectFile } from "@/utils/tauriFileDialog";
import defaultTerminalImg from "../../assets/default_terminal.png";
import { useEffect, useState } from "react";
import { getAvatar, uploadAvatar } from "@/utils/file";

interface SSHCardProps {
  host?: string;
  hostname?: string;
  user?: string;
  identity_file?: string;
  terminal: string;
  updateHost: (updateHost: Host) => void;
  deleteHost: () => void;
}

const formSchema = z.object({
  host: z.string(),
  hostname: z.string(),
  user: z.string(),
  identity_file: z.string(),
});

export function SSHCard({
  host = "___",
  hostname = "__",
  user = "__",
  identity_file = "None",
  terminal = "powershell",
  updateHost,
  deleteHost,
}: SSHCardProps) {
  type FormData = z.infer<typeof formSchema>;
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host,
      hostname,
      user,
      identity_file,
    },
  });

  const { setValue } = form;

  async function onSubmit(data: FormData) {
    updateHost(data);
  }

  const handleConnect = async () => {
    try {
      //TODO: improve feature
      await invoke("handle_connect", { host, terminal });
    } catch (error) {
      console.error("Failed to connect via SSH:", error);
    }
  };

  const handleSelectFile = async () => {
    const filePath = await selectFile();
    if (filePath) {
      // Set the selected file path in the form field
      setValue("identity_file", filePath);
    } else {
      console.log("No file selected");
    }
  };

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [image_url, setImageUrl] = useState(defaultTerminalImg);

  //this is very bad, useEffect having a async function so the image wont be rendered
  useEffect(() => {
    const checkAvatarExists = async () => {
      const avatar = await getAvatar(host);

      if (avatar) {
        setImageUrl(URL.createObjectURL(avatar));
        setAvatarFile(avatar);
        setAvatarPreview(URL.createObjectURL(avatar));
      }
    };

    checkAvatarExists();
  }, []);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setAvatarFile(file); // Store the file for saving later
    setAvatarPreview(URL.createObjectURL(file)); // Update preview
  };

  const onSubmitAvatar = async () => {
    if (!avatarFile) return;
    try {
      await uploadAvatar(host, avatarFile);
      setImageUrl(URL.createObjectURL(avatarFile));
      setAvatarFile(avatarFile);
      setAvatarPreview(URL.createObjectURL(avatarFile));
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center space-x-4">
        <Avatar className="w-24 h-24 sm:w-30 sm:h-30 md:w-36 md:h-36 lg:w-40 lg:h-40">
          <AvatarImage
            src={image_url}
            alt="@shadcn"
            className="w-full h-full object-contain"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <CardTitle>{host}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row justify-between">
          <p>IP</p> <p>{hostname}</p>
        </div>
        <div className="flex flex-row justify-between">
          <p>User</p> <p>{user}</p>
        </div>
        <div className="flex flex-row justify-between ">
          <p>Key</p>
          <p className="truncate w-3/5 text-right">
            {identity_file
              ? identity_file.replace(/\\/g, "/").split("/").pop()
              : "No file selected"}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Edit</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit host</DialogTitle>
              <DialogDescription>
                Make changes here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <FormField
                    control={form.control}
                    name="hostname"
                    render={({ field }) => {
                      return (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="hostname" className="text-right">
                            Hostname
                          </FormLabel>
                          <FormControl>
                            <Input className="col-span-3" {...field} />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="user"
                    render={({ field }) => {
                      return (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="user" className="text-right">
                            User
                          </FormLabel>
                          <FormControl>
                            <Input className="col-span-3" {...field} />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="identity_file"
                    render={({ field }) => {
                      return (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel
                            htmlFor="user"
                            className="text-right flex-grow"
                          >
                            SSH Key
                          </FormLabel>
                          <FormControl className="col-span-3">
                            <div className="w-full flex items-center justify-between space-x-2">
                              <Input
                                type="text"
                                value={
                                  field.value
                                    ? field.value
                                        .replace(/\\/g, "/")
                                        .split("/")
                                        .pop()
                                    : identity_file
                                } // Normalize and extract the file name
                                readOnly
                                placeholder="Select a file"
                                className="flex-1 pointer-events-none" // Allow input to take most of the space
                              />
                              <Button
                                onClick={handleSelectFile}
                                className="ml-2"
                                type="button"
                              >
                                Browse
                              </Button>
                            </div>
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 pb-10">
                  <div className="flex justify-end col-span-1">Avatar</div>
                  <div className="relative w-full h-12 col-span-3 group">
                    <div className="w-full h-full overflow-hidden rounded-md border bg-gray-900 flex items-center justify-center">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <span className="text-gray-400">
                          No avatar selected
                        </span>
                      )}
                    </div>

                    {/* Hidden File Input */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                    />

                    {/* Hover to Show Upload Button */}
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-semibold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Change
                    </label>
                  </div>
                </div>
                <DialogFooter className="w-full sm:justify-between">
                  <Button variant="destructive" onClick={deleteHost}>
                    Delete
                  </Button>
                  <DialogClose>
                    <Button type="submit" onClick={onSubmitAvatar}>
                      Save changes
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <Button onClick={handleConnect}>Connect</Button>
      </CardFooter>
    </Card>
  );
}
