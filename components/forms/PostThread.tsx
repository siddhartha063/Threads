"use client";

import React, { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useOrganization } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";

const axios = require("axios");

interface Props {
  userId: string;
}

function PostThread({ userId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [correctedText, setCorrectedText] = useState<string>("");
  const [loading, setloading] = useState(false);
  const [Loading, setLoading] = useState(false);

  const { organization } = useOrganization();

  const form = useForm<z.infer<typeof ThreadValidation>>({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: "",
      accountId: userId,
    },
  });

  const generateHashtags = async (values: z.infer<typeof ThreadValidation>) => {
    setLoading(true);
    try {
      const options = {
        method: 'POST',
        url: 'https://open-ai21.p.rapidapi.com/chatmpt',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': 'ce222f844dmshe102f93562134c4p184e64jsn78b106510366',
          'X-RapidAPI-Host': 'open-ai21.p.rapidapi.com',
        },
        data: {
          message: 'Generate relatable hashtags for my post: ' + values.thread,
        },
      };
  
    const response = await axios.request(options);
    console.log(response.data.MPT);
    const generatedHashtags = response.data.MPT; // Assuming the response structure is different from the previous API

    if (generatedHashtags && typeof generatedHashtags === 'string') {
      const hashtagArray = generatedHashtags.split(' '); // Split the string into an array of hashtags
      setHashtags(hashtagArray);
    } else {
      console.error('Invalid generated hashtags data:', generatedHashtags);
    }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Set loading state back to false after API call, whether successful or not
    }
  };
  

  const correctMistakes = async (values: z.infer<typeof ThreadValidation>) => {
    setloading(true);
    try {
      const options = {
        method: 'POST',
        url: 'https://open-ai21.p.rapidapi.com/chatmpt',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': 'ce222f844dmshe102f93562134c4p184e64jsn78b106510366',
          'X-RapidAPI-Host': 'open-ai21.p.rapidapi.com',
        },
        data: {
          message: 'Correct the mistakes in my post:\n' + values.thread,
        },
      };
  
      const response = await axios.request(options);
      console.log(response);
      setCorrectedText(response.data.MPT); // Assuming the response structure is different from the previous API
    } catch (error) {
      console.error(error);
    } finally {
      setloading(false); // Set loading state back to false after API call, whether successful or not
    }
  };
  

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    await createThread({
      text: values.thread,
      author: userId,
      communityId: organization ? organization.id : null,
      path: pathname,
    });

    router.push("/");
  };

  return (
    <Form {...form}>
      <form
        className="mt-10 flex flex-col justify-start gap-10"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea rows={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className="bg-sky-400"
          type="button"
          onClick={form.handleSubmit(generateHashtags)}
        >
          Generate Relatable Hashtags
        </Button>
        {Loading ? (
          <div className="bg-light-1 p-4 rounded-md animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
            <p className="text-dark-1 ml-96 mb-2">Loading....</p>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
        ) : (
          hashtags.length > 0 && (
            <div className="bg-light-1 p-4 rounded-md mt-4">
              <p className="text-dark-1">Generated Hashtags:</p>
              <ul className="mt-2">
                {hashtags.map((tag, index) => (
                  <li key={index} className="text-dark-2">
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          )
        )}

        <Button
          className="bg-green-400"
          type="button"
          onClick={form.handleSubmit(correctMistakes)}
        >
          Correct Mistakes in Post
        </Button>

        {loading ? (
          <div className="bg-light-1 p-4 rounded-md animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
            <p className="text-dark-1 ml-96 mb-2">Loading....</p>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
        ) : correctedText ? (
          <div className="bg-light-1 p-4 rounded-md">
            <p>Corrected Text:</p>
            <p className="text-dark-1">{correctedText}</p>
          </div>
        ) : null}

        <Button type="submit" className="bg-primary-500">
          Post Thread
        </Button>
      </form>
    </Form>
  );
}

export default PostThread;
