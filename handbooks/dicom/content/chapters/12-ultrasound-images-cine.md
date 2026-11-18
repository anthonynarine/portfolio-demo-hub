---
number: 12
title: Ultrasound images and cine: what a vascular study really contains
objective: Know what is inside the ultrasound objects a vascular study produces (pixels, frames, timing, calibration and burned-in text), and how to turn them into browser images without losing the original.
status: draft
---

## At the machine

A typical vascular study ends with a few dozen objects. For a carotid exam you might store greyscale B-mode images of the plaque, color Doppler images showing flow, spectral Doppler images with the waveform and the velocity cursor on the screen, a few cine clips of a tricky segment, and perhaps the machine's measurement summary page. Every one of them is a capture of the screen you were looking at, including whatever was printed on it: the patient's name, the date, the depth scale, your annotation "RT PROX ICA".

That last detail matters more than it seems. Ultrasound is the modality where the picture almost always contains text. An application that shows, crops, or shares these images is handling patient identifiers *inside the pixels*, not just in the header. This chapter goes through what an ultrasound object actually holds and what a receiver has to do with it.

## On the wire

### Two storage classes

Ultrasound images arrive as one of two SOP classes (PS3.6, Annex A):

| SOP Class | UID | What it is |
|---|---|---|
| Ultrasound Image Storage | `1.2.840.10008.5.1.4.1.1.6.1` | A single frame: one still |
| Ultrasound Multi-frame Image Storage | `1.2.840.10008.5.1.4.1.1.3.1` | Many frames in one object: a cine clip |

A cine clip is *one* DICOM instance with one SOP Instance UID, not a folder of images. Its frames sit one after another in Pixel Data, and its header says how many there are and how far apart in time.

### How the pixels are described

The image pixel attributes describe the layout of Pixel Data. PS3.3 §C.8.5.6 (the US Image Module) constrains them for ultrasound:

- **Photometric Interpretation** `(0028,0004)` says what a pixel's numbers mean. The defined terms for US are `MONOCHROME2` (greyscale, 0 = black), `PALETTE COLOR` (each pixel is an index into a color table), `RGB`, and the YBR family (`YBR_FULL`, `YBR_FULL_422`, `YBR_RCT`, `YBR_ICT`, `YBR_PARTIAL_420`), which store brightness and color difference instead of red, green and blue.
- For color (three samples), the value follows the compression. Uncompressed images, and lossless ones without a color transform, are `RGB`, JPEG lossy images are `YBR_FULL_422`, MPEG-2, H.264 and HEVC video are `YBR_PARTIAL_420`, and JPEG 2000 uses `YBR_ICT` or `YBR_RCT`.
- **Samples per Pixel** `(0028,0002)`: 1 for greyscale and palette, 3 for every color form.
- **Bits Allocated** `(0028,0100)` is 8 (16 is allowed only for a 16-bit palette), and **Bits Stored** equals Bits Allocated.
- **Planar Configuration** `(0028,0006)` says whether color samples are interleaved per pixel (`0`: R,G,B,R,G,B…) or stored as whole planes (`1`).

In practice, a vascular study mixes these: greyscale stills, RGB color stills, and JPEG-compressed or video-compressed cine. A receiver that assumes "8-bit RGB" will mis-draw the first JPEG clip it meets. Let your toolkit decode the pixels, and test with every combination your machines send.

### Frames and timing

A multi-frame object adds the Multi-frame Module and the Cine Module (PS3.3 §C.7.6.6, §C.7.6.5):

<div class="pairs">
<div><span>Number of Frames</span><p><code>(0028,0008)</code>, how many frames Pixel Data holds.</p></div>
<div><span>Frame Increment Pointer</span><p><code>(0028,0009)</code>, which attribute gives the frame spacing. For US multi-frame the defined terms are Frame Time and Frame Time Vector.</p></div>
<div><span>Frame Time</span><p><code>(0018,1063)</code>, the nominal time between frames, <strong>in milliseconds</strong>. 40 means 25 frames per second.</p></div>
<div><span>Frame Time Vector</span><p><code>(0018,1065)</code>, one increment per frame (milliseconds), for clips whose frames aren't evenly spaced. The first value is always 0.</p></div>
<div><span>Cine Rate</span><p><code>(0018,0040)</code>, optional, frames per second.</p></div>
<div><span>Recommended Display Frame Rate</span><p><code>(0008,2144)</code>, optional, how fast to play it back.</p></div>
</div>

Get the units right: Frame Time is a gap in milliseconds, Cine Rate is a rate per second. A player that reads 40 as "40 frames per second" plays the clip 60% too fast, and a heart rate judged from that clip is wrong.

### Calibration: the Sequence of Ultrasound Regions

An ultrasound screen is not one image. It's several rectangles with different meanings: the 2D image with a color box, and below it a spectral Doppler display where the horizontal axis is time and the vertical axis is velocity. The **US Region Calibration Module** (PS3.3 §C.8.5.5) describes each rectangle as an item of the **Sequence of Ultrasound Regions** `(0018,6011)`:

| Attribute | Tag | What it says |
|---|---|---|
| Region Location Min X0 / Min Y0 / Max X1 / Max Y1 | `(0018,6018)` `(0018,601A)` `(0018,601C)` `(0018,601E)` | The rectangle, in pixels from the top-left (0,0) |
| Region Spatial Format | `(0018,6012)` | `0001` 2D, `0002` M-mode, `0003` spectral, `0004` waveform, `0005` graphics |
| Region Data Type | `(0018,6014)` | `0001` tissue, `0002` color flow, `0003` PW spectral Doppler, `0004` CW spectral Doppler… |
| Physical Units X / Y Direction | `(0018,6024)` `(0018,6026)` | `0003` cm, `0004` seconds, `0007` cm/sec… |
| Physical Delta X / Y | `(0018,602C)` `(0018,602E)` | How many physical units one pixel spans |
| Reference Pixel X0 / Y0 | `(0018,6020)` `(0018,6022)` | Optional: the pixel where the physical value is zero (e.g. the Doppler baseline) |

<figure class="diagram">
<svg viewBox="0 0 720 330" role="img" aria-label="An ultrasound frame: burned-in patient text across the top, a 2D region with tissue and color flow, and a spectral Doppler region below it, each described by one item of the Sequence of Ultrasound Regions.">
<rect x="150" y="10" width="420" height="310" rx="4" class="box"/>
<rect x="160" y="18" width="400" height="28" rx="2" class="box dashed accent"/>
<text x="360" y="37" text-anchor="middle" class="small">burned-in text: patient name, ID, date, "RT PROX ICA"</text>
<rect x="160" y="56" width="400" height="140" rx="2" class="box"/>
<text x="360" y="112" text-anchor="middle">Region 1: 2D</text>
<text x="360" y="132" text-anchor="middle" class="small muted">Spatial Format 0001 · Data Type 0002 color flow</text>
<text x="360" y="150" text-anchor="middle" class="small muted">Physical Delta X/Y in cm per pixel</text>
<rect x="160" y="206" width="400" height="104" rx="2" class="box"/>
<text x="360" y="244" text-anchor="middle">Region 2: spectral Doppler</text>
<text x="360" y="264" text-anchor="middle" class="small muted">Spatial Format 0003 · Data Type 0003 PW</text>
<text x="360" y="282" text-anchor="middle" class="small muted">X in seconds · Y in cm/sec from the baseline</text>
<text x="140" y="37" text-anchor="end" class="small">in the pixels</text>
<text x="140" y="130" text-anchor="end" class="small">item 1 of</text>
<text x="140" y="146" text-anchor="end" class="small">(0018,6011)</text>
<text x="140" y="255" text-anchor="end" class="small">item 2 of</text>
<text x="140" y="271" text-anchor="end" class="small">(0018,6011)</text>
</svg>
<figcaption>Figure 12.1 — One ultrasound frame. The header calibrates each rectangle, so a measurement can be converted from pixels to centimeters or cm/s; the text at the top is part of the picture itself.</figcaption>
</figure>

Calibration is what makes a pixel distance mean something. In a 2D region with Physical Delta X of 0.0125 cm, 80 pixels are 1.0 cm. In a PW Doppler region, a vertical pixel offset from the baseline times Physical Delta Y gives a velocity in cm/s. When you crop or resize an image for a report, the calibration no longer matches the new pixels. That's fine for a picture in a report, but it means a crop is for looking at, never for measuring.

### Text in the pixels

The General Image Module (PS3.3 §C.7.6.1) has **Burned In Annotation** `(0028,0301)`, `YES` or `NO`: does the image contain enough burned-in annotation to identify the patient and the date? It's Type 3, optional. If it's absent, you know nothing. There's also **Recognizable Visual Features** `(0028,0302)`.

Treat ultrasound pixels as containing patient identifiers unless you have checked. That shapes three decisions:

1. **Where pixels go.** A thumbnail, a crop or a frame grab carries the same identifiers as the original. It belongs in the same protected storage, under the same access rules.
2. **De-identification.** Removing the header tags is not enough; the text has to be masked in the pixels (Chapter 18).
3. **Logs and errors.** Never write image content, or OCR'd text from it, into logs or error trackers.

### Renditions for the browser

Browsers don't display DICOM. To show a study on a web page, a system makes **renditions**: PNG or JPEG for a still, MP4 for a clip, small thumbnails for a grid.

<figure class="diagram">
<svg viewBox="0 0 720 250" role="img" aria-label="The original DICOM object is stored and kept; decoded renditions for the browser (a PNG still, an MP4 clip, a thumbnail) and a cropped snip are derived from it and point back to it.">
<defs><marker id="ch12-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="85" width="200" height="80" rx="4" class="box accent"/>
<text x="120" y="115" text-anchor="middle">Original DICOM</text>
<text x="120" y="135" text-anchor="middle" class="small muted">kept unchanged: the record</text>
<text x="120" y="151" text-anchor="middle" class="small muted">SOP Instance UID</text>
<line x1="220" y1="105" x2="440" y2="40" marker-end="url(#ch12-arrow)"/>
<line x1="220" y1="120" x2="440" y2="100" marker-end="url(#ch12-arrow)"/>
<line x1="220" y1="135" x2="440" y2="160" marker-end="url(#ch12-arrow)"/>
<line x1="220" y1="150" x2="440" y2="220" class="dashed" marker-end="url(#ch12-arrow)"/>
<text x="320" y="62" text-anchor="middle" class="small">decode</text>
<text x="330" y="208" text-anchor="middle" class="small">crop, by a person</text>
<rect x="440" y="18" width="260" height="44" rx="4" class="box"/>
<text x="570" y="45" text-anchor="middle">PNG or JPEG still</text>
<rect x="440" y="78" width="260" height="44" rx="4" class="box"/>
<text x="570" y="105" text-anchor="middle">MP4 clip (frame rate from header)</text>
<rect x="440" y="138" width="260" height="44" rx="4" class="box"/>
<text x="570" y="165" text-anchor="middle">Thumbnail</text>
<rect x="440" y="198" width="260" height="44" rx="4" class="box"/>
<text x="570" y="218" text-anchor="middle">Snip for the report</text>
<text x="570" y="234" text-anchor="middle" class="small muted">source UID + crop + frame time</text>
</svg>
<figcaption>Figure 12.2 — Renditions are derived and disposable; the original is the record. Every derived file points back to its source.</figcaption>
</figure>

The rules that keep this safe:

- **Keep the original.** Renditions are lossy and lose the header, the calibration and every frame you didn't convert. They can always be regenerated from the original; the original can never be rebuilt from them.
- **Derive the frame rate from the header.** An MP4 encoded at a guessed 30 fps from a 25 fps clip changes the apparent heart rate.
- **Point back.** Each rendition records the SOP Instance UID it came from (and, for a frame of a clip, which frame or time).
- **Same protection as the original.** Burned-in text came along.

## Lab

**Make a synthetic cine clip, decode it, and turn it into browser renditions.** The clip is drawn with numpy: a grey "vessel" whose width pulses and a color box that flips from red to blue. It contains no text and no patient data.

```bash
pip install pydicom==3.0.1 numpy==2.1.3 pillow==11.0.0
brew install ffmpeg      # or apt install ffmpeg, for the MP4 step
```

Save as `make_cine.py`:

```python
# make_cine.py: a synthetic ultrasound cine clip (US Multi-frame), drawn with numpy.
import numpy as np
from pydicom.dataset import Dataset, FileMetaDataset
from pydicom.sequence import Sequence
from pydicom.uid import ExplicitVRLittleEndian, UltrasoundMultiFrameImageStorage, generate_uid

frames, rows, cols = 20, 240, 320
pixels = np.zeros((frames, rows, cols, 3), dtype=np.uint8)
yy, xx = np.mgrid[0:rows, 0:cols]
for f in range(frames):
    # a grey "vessel" band whose width pulses with a fake heartbeat
    half = 18 + int(6 * np.sin(2 * np.pi * f / frames))
    band = np.abs(yy - 100) < half
    pixels[f][~band] = (60, 60, 60)
    pixels[f][band] = (10, 10, 10)
    # a red/blue "color box" that flips direction half way through the cycle
    box = (yy > 70) & (yy < 130) & (xx > 120) & (xx < 200) & band
    pixels[f][box] = (200, 30, 30) if f < frames // 2 else (30, 30, 200)

ds = Dataset()
ds.SOPClassUID = UltrasoundMultiFrameImageStorage
ds.SOPInstanceUID = generate_uid()
ds.StudyInstanceUID = generate_uid()
ds.SeriesInstanceUID = generate_uid()
ds.Modality = "US"
ds.PatientName = "TEST^PATIENT"
ds.PatientID = "DEMO-0001"
ds.BurnedInAnnotation = "NO"          # we drew no text into the pixels

ds.Rows, ds.Columns = rows, cols
ds.SamplesPerPixel = 3
ds.PhotometricInterpretation = "RGB"
ds.PlanarConfiguration = 0            # R,G,B,R,G,B... per pixel
ds.BitsAllocated = ds.BitsStored = 8
ds.HighBit = 7
ds.PixelRepresentation = 0
ds.NumberOfFrames = frames
ds.FrameTime = 40                     # milliseconds per frame (25 frames/s)
ds.FrameIncrementPointer = 0x00181063 # "frames are spaced by Frame Time"

region = Dataset()                    # one calibrated 2D region covering the image
region.RegionSpatialFormat = 0x0001   # 2D
region.RegionDataType = 0x0001        # tissue
region.RegionFlags = 0
region.RegionLocationMinX0, region.RegionLocationMinY0 = 0, 0
region.RegionLocationMaxX1, region.RegionLocationMaxY1 = cols - 1, rows - 1
region.PhysicalUnitsXDirection = region.PhysicalUnitsYDirection = 0x0003  # cm
region.PhysicalDeltaX = region.PhysicalDeltaY = 0.0125                     # cm per pixel
ds.SequenceOfUltrasoundRegions = Sequence([region])

ds.PixelData = pixels.tobytes()
ds.file_meta = FileMetaDataset()
ds.file_meta.MediaStorageSOPClassUID = ds.SOPClassUID
ds.file_meta.MediaStorageSOPInstanceUID = ds.SOPInstanceUID
ds.file_meta.TransferSyntaxUID = ExplicitVRLittleEndian
ds.save_as("cine.dcm", enforce_file_format=True)
print("wrote cine.dcm", ds.NumberOfFrames, "frames")
```

Then `export_frames.py`, which reads the clip back the way a receiver would:

```python
# export_frames.py: browser renditions (PNG per frame) from a DICOM cine; the original is untouched.
import sys
from pathlib import Path
from PIL import Image
from pydicom import dcmread

ds = dcmread(sys.argv[1])
frames = ds.pixel_array            # shape (frames, rows, cols, 3) for this RGB clip
out = Path("frames")
out.mkdir(exist_ok=True)
for i, frame in enumerate(frames):
    Image.fromarray(frame).save(out / f"frame-{i:03d}.png")

frame_ms = float(ds.FrameTime)
print(f"{len(frames)} frames, {frame_ms} ms each = {1000 / frame_ms:.0f} frames/s")
calibration = ds.SequenceOfUltrasoundRegions[0]
print("cm per pixel:", calibration.PhysicalDeltaX, calibration.PhysicalDeltaY)
```

```bash
python make_cine.py
python export_frames.py cine.dcm
```

```text
wrote cine.dcm 20 frames
20 frames, 40.0 ms each = 25 frames/s
cm per pixel: 0.0125 0.0125
```

Now make the clip a browser can play, using the frame rate you just computed from the header, not a guess:

```bash
ffmpeg -framerate 25 -i frames/frame-%03d.png -c:v libx264 -pix_fmt yuv420p clip.mp4
ls -l cine.dcm clip.mp4
```

The DICOM is about 4.6 MB (20 uncompressed RGB frames); the MP4 is a few kilobytes. That's why systems keep both: the small file for viewing, the original for the record. Open a few PNGs: the color box is red in the first half of the cycle and blue in the second.

Two more things to try. Change `FrameTime` to `20` and re-run `export_frames.py`: the computed rate doubles, and so would your MP4's speed. And compute a distance: the vessel band is 35 pixels tall at rest, so 35 × 0.0125 ≈ 0.44 cm.

## In Lumen

This is where Lumen's image pane already lives. Today a technologist can drop stills, cine clips and DICOM files into an exam, and the Media service keeps each original in object storage with a database row as its record. The **snip tool** is a rendition in exactly this chapter's sense: the technologist drags a rectangle on an image or a paused cine frame, and Lumen saves the crop as a new PNG labeled with what it shows ("Proximal ICA"), recording the source image, the crop rectangle and, for a clip, the frame time. The source stays untouched. Snips can then be placed in the Final Report's images section.

Because ultrasound pixels contain burned-in text, snips and every other rendition are stored and authorized exactly like the originals: same organization and facility scoping, no image content in logs. The planned machine ingest (Part VI) extends the same rule to objects that arrive from a gateway: store the original as received, then generate browser renditions from it, each pointing back to the original's SOP Instance UID.

## How it fails

- **Wrong color.** A YBR JPEG clip decoded as if it were RGB comes out green and purple. Let the toolkit apply the photometric interpretation and test with each compression your machines use.
- **Wrong speed.** Frame Time read as frames per second, or the MP4 encoded at a default rate. The clip plays at the wrong speed and a waveform's timing looks wrong.
- **Calibration lost.** A measurement is taken on a resized rendition or a cropped snip using the original's Physical Delta. The distances are wrong.
- **Identifiers leak through pixels.** A thumbnail is served from a public bucket, or a teaching export removes header tags but keeps the burned-in name.
- **Originals replaced.** A system stores only the MP4 to save space. The calibration, the remaining frames and the original's identity are gone for good.
- **Missing Burned In Annotation read as "no".** The attribute is optional; absent means unknown, not safe.

## Evidence

You understand this chapter when you can take a cine object, say how many frames it holds and how fast it should play from its header alone, name each calibrated region on its screen and what one pixel means in it, and show that every rendition you generated points back to an original that's still stored.

## Workbook

1. A clip has Frame Time 33.3. How many frames per second is that, and what goes wrong if a player treats the number as a rate?
2. Why is a cropped snip fine for a report but not for measuring a stenosis?
3. A teaching export removes Patient's Name `(0010,0010)` from every header. Why is that not enough for ultrasound?
4. Which Photometric Interpretation would you expect on a JPEG-lossy color cine, and why does it matter to your decoder?
5. Your storage budget is tight. Someone proposes keeping only the MP4 renditions. What do you lose?

## Answers

1. 1000 ÷ 33.3 ≈ 30 frames per second, because Frame Time `(0018,1063)` is the gap between frames in milliseconds ("Frames and timing"). A player that reads 33.3 as a rate would play the clip at about 33 fps instead of 30, about 10% fast; the bigger mistake is the reverse, reading a rate such as Cine Rate as a gap. Always check which attribute the Frame Increment Pointer names, and its units.
2. Calibration is defined for the original pixels: Physical Delta X/Y says what one pixel of the *original* region spans (Figure 12.1). A crop moves the origin and a resize changes the pixel size, so the original calibration no longer applies. A snip is a picture of the finding for the reader; measurements belong on the original, on the machine or in a viewer that uses the header.
3. Because ultrasound images usually have the patient's name, ID and the date burned into the pixels ("Text in the pixels"). Header de-identification leaves that text visible on every image. The pixels have to be masked as well (Chapter 18), and Burned In Annotation being absent tells you nothing.
4. `YBR_FULL_422`, which PS3.3 §C.8.5.6 requires for JPEG lossy color. It stores brightness and color difference with reduced color resolution, not red, green and blue. A decoder that assumes RGB shows wrong colors; one that honors the attribute converts correctly. That is why you test with each transfer syntax your machines actually send.
5. Everything that makes the object a clinical record: the header (identity, UIDs, accession, timing), the calibration regions, full-quality frames (MP4 is lossy), and the ability to regenerate any rendition or re-send to another system. You'd also lose the link from the clip back to its study by SOP Instance UID. Keep originals; make renditions disposable (Figure 12.2).

<p class="sources">Sources: DICOM PS3.3 §C.8.5.6 (US Image Module: Photometric Interpretation, Samples per Pixel, Bits Allocated, Planar Configuration, Frame Increment Pointer), §C.8.5.5 (US Region Calibration Module: Sequence of Ultrasound Regions, spatial format, data type, physical units), §C.7.6.1 (General Image Module: Burned In Annotation, Recognizable Visual Features), §C.7.6.5 (Cine Module: Frame Time, Frame Time Vector, Cine Rate, Recommended Display Frame Rate), §C.7.6.6 (Multi-frame Module); PS3.6 Annex A (Ultrasound Image Storage and Ultrasound Multi-frame Image Storage UIDs).</p>
