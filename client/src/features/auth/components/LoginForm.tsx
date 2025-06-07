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

const loginCredentialSchema = userCredentialsSchema.omit({
  name: true,
});
type LoginFormData = z.infer<typeof loginCredentialSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const router = useRouter();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginCredentialSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();
      router.navigate({ to: "/" });
      toast({
        title: "Logged in",
        description: "You have been logged in",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Login",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const handleSubmit = form.handleSubmit((data) => {
    loginMutation.mutate(data);
  });
  return (
    <Form {...form}>
      <Card>
        <form onSubmit={handleSubmit}>
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
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>
          <Link to="/register" variant="ghost" className="justify-center py-1">
            Don't have an account? Register
          </Link>
        </form>
      </Card>
    </Form>
  );
}
