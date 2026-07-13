alter table public.quiz_results
add constraint quiz_results_session_id_unique
unique (session_id);
