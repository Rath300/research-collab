import { supabase } from "@/lib/supabaseClient";

export default function NewProject() {
  // supabase is already imported as a singleton

  return (
    <div>
      <h1>New Project</h1>
      <form>
        <div>
          <label htmlFor="project-name">Project Name:</label>
          <input type="text" id="project-name" />
        </div>
        <div>
          <label htmlFor="project-description">Description:</label>
          <textarea id="project-description"></textarea>
        </div>
        <button type="submit">Create Project</button>
      </form>
    </div>
  );
} 