"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const coreIntegrations = [
  {
    name: "Salesforce",
    category: "CRM & Pipeline",
    logo: "/integrations/salesforce.png",
    description:
      "Syncs opportunities, account notes, stage history, and custom deal fields automatically.",
  },
  {
    name: "Gmail & Workspace",
    category: "Communication",
    logo: "/integrations/gmail.png",
    description:
      "Indexes prospect threads, attachments, and stakeholder commitments in context.",
  },
  {
    name: "Slack",
    category: "Deal Rooms",
    logo: "/integrations/slack.png",
    description:
      "Query your workspace directly from deal channels and capture internal decisions.",
  },
  {
    name: "Zoho CRM",
    category: "CRM & Contacts",
    logo: "/integrations/zoho.png",
    description:
      "Enriches deal rooms with contact hierarchies, historical quotes, and playbooks.",
  },
];

const ecosystemTags = [
  { name: "Google Drive", category: "Cloud Storage" },
  { name: "Notion", category: "Knowledge Wiki" },
  { name: "HubSpot", category: "CRM Suite" },
  { name: "Microsoft 365", category: "Enterprise Suite" },
  { name: "SharePoint", category: "Document Repo" },
  { name: "Zendesk", category: "Support Tickets" },
  { name: "Linear", category: "Product Roadmap" },
  { name: "Jira", category: "Engineering Specs" },
];

export default function Integration() {
  return (
    <section className="relative w-full overflow-hidden bg-[#050507] px-4 py-20 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Clean Left-Aligned Split Header */}
        <motion.div
          className="flex flex-col justify-between gap-6 border-white/[0.07] border-b pb-8 lg:flex-row lg:items-end"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="max-w-xl font-semibold text-3xl text-white tracking-[-0.025em] sm:text-4xl">
            Every revenue signal, indexed in one place.
          </h2>
          <div className="flex max-w-md flex-col items-start gap-2.5">
            <p className="text-xs text-zinc-400 leading-relaxed sm:text-sm">
              Connect your existing CRM, cloud storage, and messaging tools in
              minutes without custom pipelines.
            </p>
            <Link
              className="group inline-flex items-center gap-1.5 font-medium text-white text-xs transition-colors hover:text-zinc-300"
              href="/integration"
            >
              <span>Browse all 120+ integrations</span>
              <ArrowUpRight className="group-hover:-translate-y-0.5 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>

        {/* Core Connectors Grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {coreIntegrations.map((item, idx) => (
            <motion.div
              className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#09090c] p-6 transition-colors duration-300 hover:border-white/15"
              initial={{ opacity: 0, y: 16 }}
              key={item.name}
              transition={{ duration: 0.45, delay: idx * 0.06 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
                  {/** biome-ignore lint/performance/noImgElement: integration logo */}
                  {/** biome-ignore lint/correctness/useImageSize: CSS sized */}
                  <img
                    alt={item.name}
                    className="h-full w-full object-contain"
                    src={item.logo}
                  />
                </div>

                <div className="mt-5">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h3 className="mt-1 font-semibold text-base text-white">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Extended Directory Strip */}
        <motion.div
          className="mt-5 rounded-2xl border border-white/[0.08] bg-[#09090c] p-6 sm:p-7"
          initial={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-sm">
              <h3 className="font-semibold text-base text-white sm:text-lg">
                Plus 120+ tools ready out of the box
              </h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                Workspace permissions are inherited from your source systems so
                reps only access files they are authorized to view.
              </p>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-4">
              {ecosystemTags.map((tool) => (
                <Link
                  className="group flex flex-col justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
                  href="/integration"
                  key={tool.name}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-zinc-200 group-hover:text-white">
                      {tool.name}
                    </span>
                    <ArrowRight className="h-3 w-3 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-300" />
                  </div>
                  <span className="mt-0.5 text-[10px] text-zinc-500">
                    {tool.category}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
