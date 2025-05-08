import { db } from './db';
import { siteSettings } from '../shared/schema';

// Function to insert default site settings
export async function seedDefaultSettings() {
  try {
    console.log('Checking if default settings need to be added...');
    
    // Get existing settings
    const existingSettings = await db.select().from(siteSettings);
    
    // If there are already settings, don't add defaults
    if (existingSettings.length > 0) {
      console.log('Settings already exist, skipping default settings creation');
      return;
    }
    
    console.log('Adding default site settings...');
    
    // Common school information
    await db.insert(siteSettings).values({ key: "schoolName", value: "St. Stephen School" });
    await db.insert(siteSettings).values({ key: "schoolTagline", value: "Excellence in Education" });
    await db.insert(siteSettings).values({ key: "schoolAddress", value: "Bailey Road, Patna, Bihar, India" });
    await db.insert(siteSettings).values({ key: "schoolEmail", value: "contact@ststephen.edu" });
    await db.insert(siteSettings).values({ key: "schoolPhone", value: "+91 612 222 3333" });
    
    // Admission status
    await db.insert(siteSettings).values({ key: "admissionOpen", value: "true" });
    
    // Social media links
    await db.insert(siteSettings).values({ key: "facebookUrl", value: "https://facebook.com/ststephenschool" });
    await db.insert(siteSettings).values({ key: "twitterUrl", value: "https://twitter.com/ststephenschool" });
    await db.insert(siteSettings).values({ key: "instagramUrl", value: "https://instagram.com/ststephenschool" });
    await db.insert(siteSettings).values({ key: "youtubeUrl", value: "https://youtube.com/ststephenschool" });
    
    // Home page hero content
    await db.insert(siteSettings).values({ key: "heroTitle", value: "Welcome to St. Stephen School" });
    await db.insert(siteSettings).values({ key: "heroSubtitle", value: "Nurturing Excellence, Building Character" });
    
    // About information
    await db.insert(siteSettings).values({ key: "aboutIntro", value: "St. Stephen School is a prestigious institution with a rich legacy of academic excellence and character building." });
    await db.insert(siteSettings).values({ key: "aboutMission", value: "Our mission is to provide quality education that nurtures intellectual, physical, emotional, and spiritual growth while instilling values of integrity, compassion, and resilience." });
    await db.insert(siteSettings).values({ key: "aboutVision", value: "To be a leading educational institution that develops future leaders committed to positive social change and global citizenship." });
    await db.insert(siteSettings).values({ key: "foundedYear", value: "1978" });
    
    console.log('Default site settings added successfully');
  } catch (error) {
    console.error('Error adding default settings:', error);
  }
}