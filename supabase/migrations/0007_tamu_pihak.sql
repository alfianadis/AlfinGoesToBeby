-- Add 'pihak' column to tamu (CPP / CPW / Bersama)
alter table tamu
  add column pihak text not null default 'Bersama'
  check (pihak in ('CPP', 'CPW', 'Bersama'));

create index idx_tamu_pihak on tamu(pihak);
