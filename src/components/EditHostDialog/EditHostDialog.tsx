import { Button } from "../ui/button";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Host } from "@/types";
import { DialogClose } from "@radix-ui/react-dialog";
import { selectFile } from "@/utils/tauriFileDialog";
import { useEffect, useState } from "react";
import { uploadAvatar } from "@/utils/file";
import { Badge } from "../ui/badge";

interface EditHostDialogProps {
  host: Host;
  updateHost: (updatedHost: Host) => void;
  deleteHost: () => void;
  setImageUrl: (url: string) => void;
  avatarURL: string;
}

const formSchema = z.object({
  host: z.string(),
  hostname: z.string(),
  user: z.string(),
  identity_file: z.string(),
  tags: z.array(z.string()).optional(),
});

export function EditHostDialog({
  host,
  updateHost,
  deleteHost,
  setImageUrl,
  avatarURL,
}: EditHostDialogProps) {
  type FormData = z.infer<typeof formSchema>;
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host: host.host,
      hostname: host.hostname,
      user: host.user,
      identity_file: host.identity_file || "",
      tags: host.tags || [],
    },
  });

  const { setValue, getValues } = form;
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarURL);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [newTag, setNewTag] = useState<string>("");

  useEffect(() => {
    setAvatarPreview(avatarURL);
  }, [host.host]);

  const handleSelectFile = async () => {
    const filePath = await selectFile();
    if (filePath) {
      // Set the selected file path in the form field
      setValue("identity_file", filePath);
    } else {
      console.log("No file selected");
    }
  };

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
      if (host.host) {
        await uploadAvatar(host.host, avatarFile);
      } else {
        console.error("Host is undefined");
      }
      setImageUrl(URL.createObjectURL(avatarFile));
      setAvatarFile(avatarFile);
      setAvatarPreview(URL.createObjectURL(avatarFile));
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    }
  };

  const handleAddTag = () => {
    const currentTags = getValues("tags") || [];
    if (newTag && !currentTags.includes(newTag)) {
      setValue("tags", [...currentTags, newTag]);
      setNewTag("");
    }
  };
  const handleRemoveTag = (tag: string) => {
    const currentTags = getValues("tags") || [];
    const filteredTags = currentTags.filter((t) => t !== tag);
    setValue("tags", filteredTags, { shouldValidate: true, shouldDirty: true });
  };

  const resetForm = () => {
    form.reset();
  };

  const onSubmit = (data: FormData) => {
    updateHost(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onCloseAutoFocus={() => resetForm()}
      >
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
                                : host.identity_file || "No file selected"
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
                    <span className="text-gray-400">No avatar selected</span>
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

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <div className="grid grid-cols-4 items-center gap-4 pb-10">
                  <div className="flex justify-end col-span-1">Tags</div>
                  <div className="col-span-3">
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                      />
                      <Button type="button" onClick={handleAddTag}>
                        Add
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap space-x-2">
                      {field.value?.map((tag: string, index: number) => (
                        <Badge
                          key={index}
                          className="flex items-center space-x-1 bg-gray-200 px-2 py-1 rounded"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-red-500"
                          >
                            &times;
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            />
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
  );
}
