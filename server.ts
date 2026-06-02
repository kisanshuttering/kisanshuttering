import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import PDFDocument from "pdfkit";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const LEADS_FILE = path.join(process.cwd(), "leads.json");

// Helper to load leads
function loadLeads() {
  if (fs.existsSync(LEADS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
    } catch (e) {
      console.error("Error reading leads file:", e);
    }
  }
  return [];
}

// Helper to save leads
function saveLeads(leads: any[]) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

// API Routes

// Submit Lead
app.post("/api/submit-lead", async (req, res) => {
  try {
    const lead = req.body;
    if (!lead || !lead.mobile) {
      return res.status(400).json({ error: "Mobile number is required" });
    }

    // Assign unique lead ID if not present
    if (!lead.id) {
      lead.id = "LID-" + Date.now();
    }
    if (!lead.date) {
      lead.date = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    }

    // Save locally
    const leads = loadLeads();
    leads.unshift(lead);
    saveLeads(leads);

    res.json({ success: true, lead });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all saved leads
app.get("/api/leads", (req, res) => {
  res.json(loadLeads());
});

// Delete a lead
app.delete("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  let leads = loadLeads();
  leads = leads.filter((lead: any) => lead.id !== id);
  saveLeads(leads);
  res.json({ success: true });
});

// Clear all leads
app.post("/api/leads/clear", (req, res) => {
  saveLeads([]);
  res.json({ success: true });
});

// Download Meta Descriptions PDF
app.get("/api/download-meta-pdf", (req, res) => {
  try {
    const doc = new PDFDocument({ margin: 50 });
    
    // Set headers for file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=kisan-shuttering-meta-descriptions.pdf");
    
    doc.pipe(res);
    
    // Header
    doc.fillColor("#111827")
       .font("Helvetica-Bold")
       .fontSize(24)
       .text("Kisan Shuttering & Scaffolding", { align: "center" });
       
    doc.moveDown(0.2);
    doc.fontSize(13)
       .fillColor("#B45309")
       .text("PROPOSED SEO META DESCRIPTIONS FOR ALL PAGES", { align: "center" });
       
    doc.moveDown(1.5);
    
    doc.fillColor("#374151")
       .font("Helvetica")
       .fontSize(11)
       .text("Below is the complete catalog of simple, attractive, and high-performance meta descriptions custom-written for every page of your website. They are structured to optimize CTR, maintain high keyword relevance, and strictly fit within proper search engine character boundaries (under 160 characters).", { align: "justify" });
       
    doc.moveDown(1.5);
    
    // Divider line
    doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor("#E5E7EB").stroke();
    doc.moveDown(1.5);
    
    const proposedMetas = [
      {
        page: "Home Page (index.html)",
        current: "Kisan Shuttering & Scaffolding is India's premium rental supplier of shuttering plates, cuplock scaffolding, prop jacks, U-jacks, adjustable spans, and MS Challi. Serving Gurgaon, Noida, Bangalore, Chennai, Hyderabad, and Coimbatore with bulk inventory and same-day site delivery. Call +91 7988862842.",
        proposed: "Rent heavy-duty shuttering plates, cuplock scaffolding, prop jacks, and MS challi. Same-day delivery across NCR, Bangalore, Chennai, and Hyderabad. Call +91 7988862842!"
      },
      {
        page: "Materials & Specifications (materials.html)",
        current: "Explore our extensive range of high-durability construction materials for rent. Detailed specifications for Steel Shuttering Plates, Cuplock Scaffolding Systems, telescopic prop jacks, and adjustable slab spans. Get direct yard rates.",
        proposed: "Explore certified construction materials for rent. Specifications for shuttering plates, cuplock scaffolding, slab spans & prop jacks. Direct yard rates. Call +91 7988862842."
      },
      {
        page: "Gurgaon Hub (scaffolding-rental-gurgaon.html)",
        current: "Rent premium shuttering plates, cuplock scaffolding, prop jacks, and adjustable spans in Gurgaon. Same-day delivery across Golf Course Road, DLF Phases, Sohna Road, New Gurgaon, and Manesar. Heavy ISO certified yard inventory. Get direct pricing of shuttering and scaffolding. Call +91 7988862842.",
        proposed: "Rent certified scaffolding systems, prop jacks, and heavy steel shuttering plates in Gurgaon (NCR). Reliable direct yard rates & immediate same-day shipping. Call +91 7988862842."
      },
      {
        page: "Manesar Sub-Zone (scaffolding-rental-manesar.html)",
        current: "Rent premium shuttering plates, cuplock scaffolding, prop jacks, and adjustable spans in Manesar. Same-day delivery from our regional Manesar scaffolding yard. Heavy ISO certified load-tested steel inventory. Call +91 7988862842.",
        proposed: "High-load certified scaffolding and heavy shuttering plates for rent in Manesar Industrial Base. Rapid flatbed transport from our regional warehouse. Call +91 7988862842."
      },
      {
        page: "Noida Hub (scaffolding-rental-noida.html)",
        current: "Rent high-grade shuttering plates, cuplock scaffolding, prop jacks, and adjustable spans in Noida. Same-day delivery across Sector 62, Sector 63, Noida Extension, Greater Noida, Pari Chowk, and Knowledge Park. Heavy-duty certified steel hardware yard.",
        proposed: "Rent certified, load-tested shuttering plates and cuplock scaffolding in Noida & Greater Noida. Direct deliveries across all active construction sectors. Call +91 7988862842."
      },
      {
        page: "Greater Noida Sub-Zone (scaffolding-rental-greater-noida.html)",
        current: "Rent certified shuttering plates, cuplock scaffolding systems, prop jacks, and adjustable spans in Greater Noida. Direct deliveries across Pari Chowk, Knowledge Park, Tech Zone, and Sector Delta. Heavily load-tested structural steel. Call +91 7988862842.",
        proposed: "Heavy-duty steel shuttering plates and scaffolding systems for rent in Greater Noida. Direct on-site deliveries across Knowledge Park and Tech Zone. Call +91 7988862842."
      },
      {
        page: "Bangalore Hub (scaffolding-rental-bangalore.html)",
        current: "Rent premium-grade shuttering plates, cuplock scaffolding, prop jacks, and adjustable spans in Bangalore. Same-day flatbed delivery across Whitefield, Electronic City, Sarjapur Road, Hebbal, and HSR Layout. Large stock yard. Call +91 7988862842.",
        proposed: "Rent premium shuttering plates, cuplock scaffolding systems, and prop jacks in Bangalore. Same-day delivery from our Whitefield yard. Reliable support. Call +91 7988862842."
      },
      {
        page: "Whitefield Sub-Zone (scaffolding-rental-whitefield.html)",
        current: "Rent premium shuttering plates, cuplock scaffolding, prop jacks, and adjustable floor spans in Whitefield, Bangalore. Direct delivery from our local Whitefield scaffolding yard. Certified structural steel. Call +91 7988862842.",
        proposed: "Get quick container delivery of heavy-duty scaffolding and steel shuttering plates in Whitefield. Factory tested, load-certified structural steel. Call +91 7988862842."
      },
      {
        page: "Chennai Hub (scaffolding-rental-chennai.html)",
        current: "Rent premium-grade rust-resistant shuttering plates, cuplock scaffolding, prop jacks, and adjustable spans in Chennai. Same-day flatbed delivery across OMR, Siruseri, Ambattur, Guindy, Tambaram, and Sriperumbudur. Call +91 7988862842.",
        proposed: "Rent heavy-duty, rust-resistant shuttering plates, cuplocks, and prop jacks in Chennai. Prompt delivery from our local Guindy yard. Immediate site support. Call +91 7988862842."
      },
      {
        page: "Guindy Sub-Zone (scaffolding-rental-guindy.html)",
        current: "Rent premium shuttering plates, cuplock scaffolding systems, prop jacks, and adjustable floor spans in Guindy, Chennai. Direct delivery from our regional Guindy scaffolding yard. Heavy ISO tested steel assets. Call +91 7988862842.",
        proposed: "Rent high-load scaffolding systems and shuttering plates in Guindy, Chennai. Dedicated industrial zone support with same-day loading and delivery. Call +91 7988862842."
      },
      {
        page: "Hyderabad Hub (scaffolding-rental-hyderabad.html)",
        current: "Rent premium-grade shuttering plates, cuplock scaffolding, prop jacks, and adjustable spans in Hyderabad. Same-day delivery across Gachibowli, HITEC City, Madhapur, Nanakramguda, Kukatpally, and Miyapur. Large stock yard. Call +91 7988862842.",
        proposed: "Rent certified cuplock scaffolding, shuttering plates, and floor spans in Hyderabad. Immediate delivery across HITEC City, Gachibowli, and key IT sectors. Call +91 7988862842."
      },
      {
        page: "Gachibowli Sub-Zone (scaffolding-rental-gachibowli.html)",
        current: "Rent premium-grade shuttering plates, cuplock scaffolding, prop jacks, and adjustable spans in Gachibowli, Hyderabad. Same-day delivery from our local Gachibowli stockyard. Certified loading capacities. Call +91 7988862842.",
        proposed: "Rent standard scaffolding & heavy steel plates in Gachibowli, Hyderabad. On-site dispatch from our local tech zone yard with certified loading capacities. Call +91 7988862842."
      },
      {
        page: "Coimbatore Hub (scaffolding-rental-coimbatore.html)",
        current: "Rent premium-grade shuttering plates, cuplock scaffolding, prop jacks, and adjustable spans in Coimbatore. Same-day transport across RS Puram, Peelamedu, Gandhipuram, Saravanampatti, and Eachanari. Call +91 7988862842.",
        proposed: "Rent supreme quality steel shuttering, cuplocks, and telescopic slab spans in Coimbatore. Fast transport across Peelamedu and Saravanampatti. Call +91 7988862842 now!"
      },
      {
        page: "Saravanampatti Sub-Zone (scaffolding-rental-saravanampatti.html)",
        current: "Rent premium-grade shuttering plates, cuplock scaffolding, prop jacks, and adjustable spans in Saravanampatti, Coimbatore. Same-day transport from our local Saravanampatti yard. Certified systems. Call +91 7988862842.",
        proposed: "Premium shuttering plates and certified cuplock scaffolding rentals in Saravanampatti, Coimbatore. Heavy-duty construction equipment at direct yard rates. Call +91 7988862842."
      }
    ];
    
    proposedMetas.forEach((meta) => {
      // Avoid placing lines too low on a page
      if (doc.y > 620) {
        doc.addPage();
        // Little top header on new pages
        doc.fillColor("#9CA3AF")
           .font("Helvetica-Oblique")
           .fontSize(8)
           .text("Kisan Shuttering - Proposed SEO Meta Descriptions Catalog", { align: "right" });
        doc.moveDown(1);
      }
      
      doc.fillColor("#111827")
         .font("Helvetica-Bold")
         .fontSize(11)
         .text(meta.page);
         
      doc.moveDown(0.15);
      
      doc.fillColor("#4B5563")
         .font("Helvetica")
         .fontSize(9)
         .text(`• Current: "${meta.current}"`, { indent: 15 });
         
      doc.moveDown(0.1);
      
      doc.fillColor("#16A34A")
         .font("Helvetica-Bold")
         .fontSize(9.5)
         .text(`• Proposed: "${meta.proposed}"`, { indent: 15 });
         
      doc.fillColor("#2563EB")
         .font("Helvetica")
         .fontSize(8)
         .text(`(Length: ${meta.proposed.length} characters | Status: Optimized and simple)`, { indent: 20 });
         
      doc.moveDown(1.0);
    });
    
    // Footer note
    if (doc.y > 650) doc.addPage();
    doc.moveDown(2);
    doc.fillColor("#9CA3AF")
       .font("Helvetica")
       .fontSize(8)
       .text("Document generated automatically by AI Studio developer assistant.", { align: "center" });
    
    doc.end();
  } catch (err) {
    console.error("Error creating PDF:", err);
    res.status(500).send("Error generating PDF document.");
  }
});

// Serve sitemap.xml directly from root main folder
app.get("/sitemap.xml", (req, res) => {
  const sitemapPath = path.join(process.cwd(), "sitemap.xml");
  if (fs.existsSync(sitemapPath)) {
    res.setHeader("Content-Type", "application/xml");
    res.sendFile(sitemapPath);
  } else {
    res.status(404).end();
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve HTML files properly
    app.get("/:page.html", (req, res, next) => {
      const pagePath = path.join(distPath, `${req.params.page}.html`);
      if (fs.existsSync(pagePath)) {
        res.sendFile(pagePath);
      } else {
        next();
      }
    });
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
