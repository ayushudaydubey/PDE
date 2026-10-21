import React from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Circle,
  User,
  ExternalLink,
  Link2,
} from 'lucide-react';

const STATUS_CONFIG = {
  'Assigned': { label: 'Assigned', Icon: Circle, badge: 'text-blue-700 bg-blue-50 border-blue-200', iconColor: 'text-[#3b82f6]' },
  'Contacted': { label: 'Contacted', Icon: Circle, badge: 'text-orange-700 bg-orange-50 border-orange-200', iconColor: 'text-[#f97316]' },
  'Meeting Scheduled': { label: 'Meeting Scheduled', Icon: Circle, badge: 'text-purple-700 bg-purple-50 border-purple-200', iconColor: 'text-[#a855f7]' },
  'Proposal Sent': { label: 'Proposal Sent', Icon: Circle, badge: 'text-indigo-700 bg-indigo-50 border-indigo-200', iconColor: 'text-[#6366f1]' },
  'Negotiation': { label: 'Negotiation', Icon: Circle, badge: 'text-yellow-700 bg-yellow-50 border-yellow-200', iconColor: 'text-[#eab308]' },
  'Won': { label: 'Won', Icon: CheckCircle2, badge: 'text-green-700 bg-green-50 border-green-200', iconColor: 'text-[#22c55e]' },
  'converted': { label: 'Won', Icon: CheckCircle2, badge: 'text-green-700 bg-green-50 border-green-200', iconColor: 'text-[#22c55e]' },
  'Lost': { label: 'Lost', Icon: XCircle, badge: 'text-red-700 bg-red-50 border-red-200', iconColor: 'text-[#ef4444]' },
  'dead': { label: 'Lost', Icon: XCircle, badge: 'text-red-700 bg-red-50 border-red-200', iconColor: 'text-[#ef4444]' },
  'On Hold': { label: 'On Hold', Icon: Circle, badge: 'text-slate-700 bg-slate-100 border-slate-300', iconColor: 'text-[#475569]' },
  'New': { label: 'New', Icon: Circle, badge: 'text-gray-600 bg-gray-50 border-gray-200', iconColor: 'text-[#cbd5e1]' },
  'none': { label: 'New', Icon: Circle, badge: 'text-gray-600 bg-gray-50 border-gray-200', iconColor: 'text-[#cbd5e1]' },
};

const formatUrlDisplay = (url) => {
  try {
    const href = url.startsWith('http') ? url : `https://${url}`;
    const parsed = new URL(href);
    const path = parsed.pathname + parsed.search;
    const display = parsed.hostname + (path !== '/' ? path : '');
    return display.length > 42 ? `${display.slice(0, 39)}…` : display;
  } catch {
    return url.length > 42 ? `${url.slice(0, 39)}…` : url;
  }
};

const normalizeContactPage = (page) => {
  const urlRaw =
    typeof page === 'string'
      ? page
      : page && (page.url || page.link)
        ? page.url || page.link
        : null;
  if (!urlRaw) return null;

  const pageName =
    typeof page === 'string'
      ? null
      : page.name && page.name.trim()
        ? page.name
        : null;

  return {
    name: pageName,
    href: urlRaw.startsWith('http') ? urlRaw : `https://${urlRaw}`,
    displayUrl: formatUrlDisplay(urlRaw),
  };
};

export const LeadStatusCardContent = ({ status = 'none', updatedBy }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.none;
  const { Icon, label, badge, iconColor } = config;

  return (
    <section className="text-left">
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-900 mb-2.5">
        Lead Status
      </p>
      <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${badge}`}
        >
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          {label}
        </span>
        {status !== 'none' && (
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
            <User className="w-3 h-3 shrink-0 text-slate-400" />
            <span>
              Updated by{' '}
              <span className="font-medium text-slate-700">{updatedBy}</span>
            </span>
          </p>
        )}
      </div>
    </section>
  );
};

export const ContactPagesCardContent = ({ contactPages = [] }) => {
  const pages = (Array.isArray(contactPages) ? contactPages : [])
    .map(normalizeContactPage)
    .filter(Boolean);

  return (
    <section className="text-left">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-900">
          Contact Pages
        </p>
        {pages.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            {pages.length}
          </span>
        )}
      </div>

      {pages.length > 0 ? (
        <div className="max-h-[32vh] overflow-y-auto custom-scrollbar -mx-1 px-1">
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white overflow-hidden">
            {pages.map((page, idx) => (
              <li key={idx}>
                <a
                  href={page.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group/link flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-indigo-50/60"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors group-hover/link:bg-indigo-100 group-hover/link:text-indigo-600">
                    <Link2 className="w-3.5 h-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800 group-hover/link:text-indigo-700">
                      {page.name || page.displayUrl}
                    </span>
                    {page.name && (
                      <span
                        className="block truncate text-xs text-slate-400 mt-0.5"
                        title={page.displayUrl}
                      >
                        {page.displayUrl}
                      </span>
                    )}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-300 opacity-0 transition-all group-hover/link:opacity-100 group-hover/link:text-indigo-500" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-5 text-center">
          <Link2 className="mx-auto mb-2 h-4 w-4 text-slate-300" />
          <p className="text-xs font-medium text-slate-500">No contact links available</p>
        </div>
      )}
    </section>
  );
};
