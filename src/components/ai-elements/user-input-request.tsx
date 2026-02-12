"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
};

type UserInputRequestProps = {
  provider: string;
  fields: Field[];
  authConfigId?: string;
  logoUrl?: string;
  onSubmit: (values: Record<string, string>) => void;
};

export function UserInputRequest({
  provider,
  fields,
  authConfigId: _authConfigId,
  logoUrl,
  onSubmit,
}: UserInputRequestProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate a small delay or just call onSubmit
    onSubmit(values);
    setIsSubmitting(false);
  };

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="my-4 w-full max-w-md border-primary/20">
      <CardHeader className="flex flex-row items-center gap-4">
        {logoUrl && (
          <Image
            alt={provider}
            className="h-8 w-8 object-contain"
            height={32}
            src={logoUrl}
            width={32}
          />
        )}
        <CardTitle className="text-lg">Connect to {provider}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {fields.map((field) => (
            <div className="space-y-2" key={field.name}>
              <Label htmlFor={field.name}>
                {field.label}{" "}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id={field.name}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                type={field.type || "text"}
                value={values[field.name] || ""}
              />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
