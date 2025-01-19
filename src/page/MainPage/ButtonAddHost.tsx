import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Host } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  host: z.string(),
  hostname: z.string(),
  user: z.string(),
  identity_file: z.string(),
});

interface ButtonAddHostProps {
  addHost: (host: Host) => void;
}

export default function ButtonAddHost({ addHost }: ButtonAddHostProps) {
  type FormData = z.infer<typeof formSchema>;
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host: "",
      hostname: "",
      user: "",
      identity_file: "",
    },
  });

  async function onSubmit(data: FormData) {
    addHost(data);
    form.reset();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add host</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add host</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => {
                  return (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel htmlFor="host" className="text-right">
                        Host
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
                        <Input className="col-span-3" {...field} />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            </div>
            <DialogFooter>
              <DialogClose>
                <Button type="submit">Save changes</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
