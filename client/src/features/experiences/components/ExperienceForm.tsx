import { LocationPicker } from "@/features/shared/components/LocationPicker";
import { Button } from "@/features/shared/components/ui/Button";
import { DateTimePicker } from "@/features/shared/components/ui/DateTimePicker";
import FileInput from "@/features/shared/components/ui/FileInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/features/shared/components/ui/Form";
import Input from "@/features/shared/components/ui/Input";
import { TextArea } from "@/features/shared/components/ui/TextArea";
import { Experience } from "@advanced-react/server/database/schema";
import { experienceValidationSchema } from "@advanced-react/shared/schema/experience";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useExperienceMutation } from "../hooks/useExperienceMutation";

type ExperienceFormData = z.infer<typeof experienceValidationSchema>;

type ExperienceFormProps = {
  experience?: Experience;
  onSuccess?: (id: Experience["id"]) => void;
  onCancel?: (id?: Experience["id"]) => void;
};
export function ExperienceForm({
  experience,
  onSuccess,
  onCancel,
}: ExperienceFormProps) {
  const { t } = useTranslation("experiences");
  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceValidationSchema),
    defaultValues: {
      id: experience?.id,
      title: experience?.title,
      content: experience?.content,
      url: experience?.url,
      scheduledAt: experience?.scheduledAt,
      location: experience?.location
        ? JSON.parse(experience?.location)
        : undefined,
    },
  });
  const { addMutation, editMutation } = useExperienceMutation({
    add: {
      onSuccess,
    },
    edit: {
      onSuccess,
    },
  });
  const mutation = experience ? editMutation : addMutation;
  const handleSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        if (key === "location") formData.append(key, JSON.stringify(value));
        else formData.append(key, value as string | Blob);
      }
    }
    mutation.mutate(formData);
  });
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.title")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.content")}</FormLabel>
              <FormControl>
                <TextArea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.link")}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value as string} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="scheduledAt"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <DateTimePicker {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.image")}</FormLabel>
              <FormControl>
                <FileInput
                  accept="image/*"
                  onChange={(event) => field.onChange(event.target?.files?.[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.venue")}</FormLabel>
              <FormControl>
                <LocationPicker {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? t("common:actions.saving")
              : t("common:actions.save")}
          </Button>
          <Button
            type={"button"}
            variant={"outline"}
            onClick={() => onCancel?.(experience?.id)}
          >
            {t("common:actions.cancel")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
