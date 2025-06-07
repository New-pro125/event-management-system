import { Button } from "@/features/shared/components/ui/Button";
import Card from "@/features/shared/components/ui/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/features/shared/components/ui/Form";
import Input from "@/features/shared/components/ui/Input";
import Link from "@/features/shared/components/ui/Link";
import { useToast } from "@/features/shared/hooks/useToast";
import { trpc } from "@/router";
import { userCredentialsSchema } from "@advanced-react/shared/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerCredentialSchema = userCredentialsSchema;
type RegisterFormData = z.infer<typeof registerCredentialSchema>;

export function RegisterForm() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const router = useRouter();
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerCredentialSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();
      router.navigate({ to: "/" });
      toast({
        title: "Signed up",
        description: "You have been signed up",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to register",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const handleSubmit = form.handleSubmit((data) => {
    registerMutation.mutate(data);
  });
  return (
    <Form {...form}>
      <Card>
        <form onSubmit={handleSubmit}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="john doe" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="dev@example.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="*********" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="my-2 w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Registering ..." : "Register"}
          </Button>
          <Link to="/login" variant="ghost" className="justify-center py-1">
            Already have an account? Login
          </Link>
        </form>
      </Card>
    </Form>
  );
}
