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
interface SSHCardProps {
  host?: string;
  hostname?: string;
  user?: string;
  identity_file?: string;
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

  async function onSubmit(data: FormData) {
    updateHost(data);
  }

  const handleConnect = async () => {
    try {
      await invoke("handle_connect", { host });
    } catch (error) {
      console.error("Failed to connect via SSH:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <Avatar className="">
          <AvatarImage
            src="https://static-00.iconduck.com/assets.00/terminal-icon-2048x1755-9uvitihz.png"
            alt="@shadcn"
            sizes=""
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
        <div className="flex flex-row justify-between">
          <p>SSH key</p> <p className="truncate w-1/2">{identity_file}</p>
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
                Make changes to your profile here. Click save when you're done.
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
                          <FormLabel htmlFor="user" className="text-right">
                            SSH Key
                          </FormLabel>
                          <FormControl>
                            {/* <input
                              type="file"
                              className="col-span-3"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  field.onChange(
                                    URL.createObjectURL(e.target.files[0])
                                  );
                                }
                              }}
                            ></input> */}
                            <Input className="col-span-3" {...field} />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <DialogFooter className="w-full sm:justify-between">
                  <Button variant="destructive" onClick={deleteHost}>
                    Delete
                  </Button>
                  <DialogClose>
                    <Button type="submit">Save changes</Button>
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
