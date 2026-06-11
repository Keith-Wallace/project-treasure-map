import { supabase } from '../lib/supabase'

/**
 * Fetch all CPE courses for the currently logged-in user.
 */
export async function getCourses() {
  const { data, error } = await supabase
    .from('cpe_courses')
    .select('*, course_category_credits(category_id, credits_earned, is_primary, course_categories(name))')
    .order('completion_date', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Fetch a single course by ID.
 */
export async function getCourseById(id) {
  const { data, error } = await supabase
    .from('cpe_courses')
    .select('*, course_category_credits(category_id, credits_earned, is_primary, course_categories(name))')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Add a new CPE course for the current user.
 * @param {Object} course - { title, provider, credits, completion_date, ... }
 */
// export async function addCourse(course) {
//   const { data, error } = await supabase
//     .from('cpe_courses')
//     .insert([course])
//     .select()
//     .single()

//   if (error) throw error
//   return data
// }

export async function addCourse(course) {
  // 1. Destructure credits and category_id out — they don't
  //    belong on cpe_courses, they go to course_category_credits
  const { credits, category_id, ...coursePayload } = course

  // 2. Insert the course record first to get the new ID back
  const { data: savedCourse, error: courseError } = await supabase
    .from('cpe_courses')
    .insert([coursePayload])
    .select()
    .single()

  if (courseError) throw courseError

  // 3. Insert into course_category_credits using the new course ID
  if (category_id && credits) {
    const { error: creditsError } = await supabase
      .from('course_category_credits')
      .insert([{
        course_id: savedCourse.id,
        category_id,
        credits_earned: parseFloat(credits),
        is_primary: true,
      }])

    if (creditsError) throw creditsError
  }

  return savedCourse
}

/**
 * Update an existing course by ID.
 * @param {string} id - Course UUID
 * @param {Object} updates - Fields to update
 */
// export async function updateCourse(id, updates) {
//   const { data, error } = await supabase
//     .from('cpe_courses')
//     .update(updates)
//     .eq('id', id)
//     .select()
//     .single()

//   if (error) throw error
//   return data
// }

export async function updateCourse(id, updates) {
  const { credits, category_id, ...coursePayload } = updates

  // 1. Update the core course record
  const { data: savedCourse, error: courseError } = await supabase
    .from('cpe_courses')
    .update(coursePayload)
    .eq('id', id)
    .select()
    .single()

  if (courseError) throw courseError

  // 2. Replace the category/credits row
  if (category_id && credits) {
    // Delete existing then re-insert (handles category change too)
    await supabase
      .from('course_category_credits')
      .delete()
      .eq('course_id', id)

    const { error: creditsError } = await supabase
      .from('course_category_credits')
      .insert([{
        course_id: id,
        category_id,
        credits_earned: parseFloat(credits),
        is_primary: true,
      }])

    if (creditsError) throw creditsError
  }

  return savedCourse
}

/**
 * Delete a course by ID.
 * @param {string} id - Course UUID
 */
export async function deleteCourse(id) {
  const { error } = await supabase
    .from('cpe_courses')
    .delete()
    .eq('id', id)

  if (error) throw error
}
