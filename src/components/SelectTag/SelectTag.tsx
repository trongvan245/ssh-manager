// components/TagSelector.tsx
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Adjust path based on your shadcn setup
import { Badge } from "../ui/badge";
import { getTagsList } from "@/utils/tags";

interface TagOption {
  value: string;
  label: string;
}

interface TagSelectorProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

export default function TagSelector({ tags, setTags }: TagSelectorProps) {
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      const tagList = await getTagsList();
      const tagOptions = tagList.map((tag) => ({ value: tag, label: tag }));
      setTagOptions(tagOptions);
      console.log("taglist", tagList);
      // Fetch tags from API or local storage
    };
    fetchTags();
  }, []);

  const handleSelect = (value: string) => {
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
      console.log("tags", tags);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="m-5 w-80">
      <Select onValueChange={handleSelect}>
        <SelectTrigger className="w-full max-w-md">
          <SelectValue placeholder="Select a tag" />
        </SelectTrigger>
        <SelectContent>
          {tagOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Tags container with fixed width and wrapping */}
      {tags.length > 0 && (
        <div className="mt-2 w-80 flex flex-wrap gap-2">
          {tags.map((tag) => {
            return (
              <Badge key={tag} className="bg-gray-200 px-2 py-1 rounded">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  ×
                </button>
              </Badge>
            );
          })}
        </div>
      )}
      {tags.length === 0 && (
        <p className="mt-2 text-gray-500 italic text-sm">No tags selected</p>
      )}

      {/* Optional: Hidden input for form submission */}
      {/* <input type="hidden" name="tags" value={tags.join(", ")} /> */}
    </div>
  );
}
