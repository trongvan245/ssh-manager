import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  fileDir: z.string(),
});

export default function ConfigurationPage() {
  type FormData = z.infer<typeof formSchema>;
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileDir: "None",
    },
  });

  async function onSubmit(data: FormData) {
    console.log(data);
  }

  return (
    <div>
      <div className="flex flex-row justify-between">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="fileDir"
                render={({ field }) => {
                  return (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel htmlFor="hostname" className="text-right">
                        File Directory
                      </FormLabel>
                      <FormControl>
                        <Input className="col-span-3" {...field} />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            </div>
          </form>
        </Form>
      </div>
      <h1>Configuration Page</h1>
    </div>
  );
}
