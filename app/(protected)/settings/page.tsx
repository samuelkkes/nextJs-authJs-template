"use client";

import React, {useState, useTransition} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {useSession} from "next-auth/react";
import {zodResolver} from "@hookform/resolvers/zod";
import {UserRole} from "@prisma/client";
import {settings} from "@/actions/settings";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {FormSuccess} from "@/components/auth/form-success";
import {settingSchema} from "@/schema";
import {useCurrentUser} from "@/hooks/use-current-user";
import {FormError} from "@/components/auth/form-error";
import Loader from "@/components/protected/loader";

const Page = () => {
    const {user, status} = useCurrentUser();

    const {update} = useSession();
    const [isPending, startTransition] = useTransition();
    const [success, setSuccess] = useState<string | undefined>();
    const [error, setError] = useState<string | undefined>();

    const form = useForm<z.infer<typeof settingSchema>>({
        resolver: zodResolver(settingSchema),
        defaultValues: {
            name: user?.name || undefined,
            email: user?.email || undefined,
            password: undefined,
            newPassword: undefined,
            role: user?.role || undefined,
            isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined
        }
    });

    const onSubmit = (values: z.infer<typeof settingSchema>) => {
        setError(undefined);
        setSuccess(undefined);
        startTransition(() => {
            settings(values)
                .then((data) => {
                    if (data.error) {
                        setError(data.error);
                    }
                    if (data.success) {
                        update();
                        setSuccess(data.success);
                    }
                })
                .catch(() => setError("Something went wrong!"));
        })
    }

    if (status === "loading") {
        return (
            <Loader/>
        )
    }

    return (
        <Card className="w-[600px]">
            <CardHeader>
                <CardTitle className="text-xl text-center">⚙️ Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="John Doe"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            {user?.isOAuth === false && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="john.doe@exemple.com"
                                                        disabled={isPending}
                                                        type="email"
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="******"
                                                        disabled={isPending}
                                                        type="password"
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="newPassword"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>New password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="******"
                                                        disabled={isPending}
                                                        type="password"
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}
                            <FormField
                                control={form.control}
                                name="role"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}
                                                disabled={isPending}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                                                <SelectItem value={UserRole.USER}>User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            {user?.isOAuth === false && (
                                <FormField
                                    control={form.control}
                                    name="isTwoFactorEnabled"
                                    render={({field}) => (
                                        <FormItem
                                            className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Two Factor Authentication</FormLabel>
                                                <FormDescription>
                                                    Enable two factor authentication for your account.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    disabled={isPending}
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                        <FormError message={error}/>
                        <FormSuccess message={success}/>
                        <Button
                            type="submit"
                            disabled={isPending}
                        >
                            Save
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};
export default Page;
