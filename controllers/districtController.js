const getMandalam = async (req, res) => {
    try {
        const mandalam = await Mandalam.find({});
        res.status(200).json(mandalam);
    } catch (error) {
        console.error("Error getting mandalam:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const addMandalam = async (req, res) => {
    try {
        const { mandalam } = req.body;
        if (!mandalam) {
            return res
                .status(400)
                .json({ error: "Please provide all required fields." });
        }
        const newMandalam = await Mandalam.create({
            mandalam,
        });
        res.status(201).json(newMandalam);
    } catch (error) {
        console.error("Error adding mandalam:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteMandalam = async (req, res) => {
    try {
        const mandalam = await Mandalam.findOneAndDelete({ _id: req.params.id });
        if (!mandalam) {
            return res.status(404).json({ error: "Mandalam not found" });
        }

        res.status(200).json({ msg: "Mandalam removed" });
    } catch (error) {
        console.error("Error deleting mandalam:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addDistrict = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res
                .status(400)
                .json({ error: "Please provide all required fields." });
        }
        const newDistrict = await District.create({
            name,
        });
        res.status(201).json(newDistrict);
    } catch (error) {
        console.error("Error adding district:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addConstituency = async (req, res) => {
    try {
        const { name, district } = req.body;

        // Check if name is provided
        if (!name) {
            return res.status(400).json({ error: "Please provide a name for the constituency." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Create a new Constituency instance
        const newConstituency = {
            name: name,
            assemblies: [] // You can initialize with empty assemblies if required
        };

        // Push the new constituency to the district's constituencies array
        existingDistrict.constituencies.push(newConstituency);

        // Save the updated district
        await existingDistrict.save();

        res.status(201).json({ message: "Constituency added successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error adding constituency:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addAssembly = async (req, res) => {
    try {
        const { name, district, constituency } = req.body;

        // Check if name, district, and constituency are provided
        if (!name || !district || !constituency) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Create a new Assembly instance
        const newAssembly = {
            name: name,
            panchayaths: []  // You can initialize with empty panchayaths if required
        };

        // Push the new assembly to the constituency's assemblies array
        existingConstituency.assemblies.push(newAssembly);

        // Save the updated district
        await existingDistrict.save();

        res.status(201).json({ message: "Assembly added successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error adding assembly:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addPanchayath = async (req, res) => {
    try {
        const { name, district, constituency, assembly } = req.body;

        // Check if name, district, constituency, and assembly are provided
        if (!name || !district || !constituency || !assembly) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the assembly within the found constituency
        const existingAssembly = existingConstituency.assemblies.find(a => a.name === assembly);

        // If assembly not found
        if (!existingAssembly) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Create a new Panchayath instance
        const newPanchayath = {
            name: name
        };

        // Push the new panchayath to the assembly's panchayaths array
        existingAssembly.panchayaths.push(newPanchayath);

        // Save the updated district
        await existingDistrict.save();

        res.status(201).json({ message: "Panchayath added successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error adding panchayath:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}



const getDistrictV4 = async (req, res) => {
    try {
        const { district, constituency, assembly, local } = req.query;
        console.log(district, constituency, assembly, local);
        if (!district && !constituency && !assembly) {
            const allDistricts = await District.find({}, 'name'); // Fetch only the 'name' field
            return res.status(200).json(allDistricts.map(d => d.name));
        }
        // If only district is provided, return all constituencies
        if (district && !constituency && !assembly) {
            const result = await District.findOne({ name: district });
            if (result) {
                return res.status(200).json(result.constituencies.map(con => con.name));
            } else {
                return res.status(404).json({ error: "District not found" });
            }
        }

        // If district and constituency are provided, return all assemblies
        if (district && constituency && !assembly) {
            const result = await District.findOne({ name: district });
            if (result) {
                const selectedConstituency = result.constituencies.find(con => con.name === constituency);
                if (selectedConstituency) {
                    return res.status(200).json(selectedConstituency.assemblies.map(asm => asm.name));
                } else {
                    return res.status(404).json({ error: "Constituency not found within the district" });
                }
            } else {
                return res.status(404).json({ error: "District not found" });
            }
        }

        // If district, constituency, and assembly are provided, return all panchayaths
        if (district && constituency && assembly && local) {
            const result = await District.findOne({ name: district });
            if (result) {
                const selectedConstituency = result.constituencies.find(con => con.name === constituency);
                if (selectedConstituency) {
                    const selectedAssembly = selectedConstituency.assemblies.find(asm => asm.name === assembly);
                    if (selectedAssembly) {
                        if (local === "panchayath") {
                            return res.status(200).json(selectedAssembly.panchayaths.map(pan => pan.name));
                        } else if (local === "municipality") {
                            return res.status(200).json(selectedAssembly.municipality.map(pan => pan.name));
                        } else if (local === "corporation") {
                            return res.status(200).json(selectedAssembly.corporation.map(pan => pan.name));
                        } else {
                            return res.status(400).json({ message: "Local not found" })
                        }
                    } else {
                        return res.status(404).json({ error: "Assembly not found within the constituency" });
                    }
                } else {
                    return res.status(404).json({ error: "Constituency not found within the district" });
                }
            } else {
                return res.status(404).json({ error: "District not found" });
            }
        }

        return res.status(400).json({ error: "Invalid parameters provided" });

    } catch (error) {
        console.error("Error fetching details:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const deleteDistrict = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if name is provided
        if (!name) {
            return res.status(400).json({ error: "Please provide a name for the district." });
        }

        // Find and delete the district
        const deletedDistrict = await District.findOneAndDelete({ name });

        // If district not found
        if (!deletedDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        res.status(200).json({ message: "District deleted successfully", deletedDistrict });
    } catch (error) {
        console.error("Error deleting district:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteConstituency = async (req, res) => {
    try {
        const { district, constituency } = req.body;

        // Check if district and constituency are provided
        if (!district || !constituency) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the index of the constituency within the found district
        const constituencyIndex = existingDistrict.constituencies.findIndex(c => c.name === constituency);

        // If constituency not found
        if (constituencyIndex === -1) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Remove the constituency from the district's constituencies array
        existingDistrict.constituencies.splice(constituencyIndex, 1);

        // Save the updated district
        await existingDistrict.save();

        res.status(200).json({ message: "Constituency deleted successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error deleting constituency:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const deleteAssembly = async (req, res) => {
    try {
        const { district, constituency, assembly } = req.body;

        // Check if district, constituency, and assembly are provided
        if (!district || !constituency || !assembly) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the index of the assembly within the found constituency
        const assemblyIndex = existingConstituency.assemblies.findIndex(a => a.name === assembly);

        // If assembly not found
        if (assemblyIndex === -1) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Remove the assembly from the constituency's assemblies array
        existingConstituency.assemblies.splice(assemblyIndex, 1);

        // Save the updated district
        await existingDistrict.save();

        res.status(200).json({ message: "Assembly deleted successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error deleting assembly:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deletePanchayath = async (req, res) => {
    try {
        const { district, constituency, assembly, panchayath } = req.body;

        // Check if district, constituency, assembly, and panchayath are provided
        if (!district || !constituency || !assembly || !panchayath) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the assembly within the found constituency
        const existingAssembly = existingConstituency.assemblies.find(a => a.name === assembly);

        // If assembly not found
        if (!existingAssembly) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Find the index of the panchayath within the found assembly
        const panchayathIndex = existingAssembly.panchayaths.findIndex(p => p.name === panchayath);

        // If panchayath not found
        if (panchayathIndex === -1) {
            return res.status(404).json({ error: "Panchayath not found within the assembly" });
        }

        // Remove the panchayath from the assembly's panchayaths array
        existingAssembly.panchayaths.splice(panchayathIndex, 1);

        // Save the updated district
        await existingDistrict.save();

        res.status(200).json({ message: "Panchayath deleted successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error deleting panchayath:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const addCorporation = async (req, res) => {
    try {
        const { name, district, constituency, assembly } = req.body;

        // Check if name, district, constituency, and assembly are provided
        if (!name || !district || !constituency || !assembly) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the assembly within the found constituency
        const existingAssembly = existingConstituency.assemblies.find(a => a.name === assembly);

        // If assembly not found
        if (!existingAssembly) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Create a new Panchayath instance
        const newPanchayath = {
            name: name
        };

        // Push the new panchayath to the assembly's panchayaths array
        existingAssembly.corporation.push(newPanchayath);

        // Save the updated district
        await existingDistrict.save();

        res.status(201).json({ message: "Panchayath added successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error adding panchayath:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const addMunicipality = async (req, res) => {
    try {
        const { name, district, constituency, assembly } = req.body;

        // Check if name, district, constituency, and assembly are provided
        if (!name || !district || !constituency || !assembly) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the assembly within the found constituency
        const existingAssembly = existingConstituency.assemblies.find(a => a.name === assembly);

        // If assembly not found
        if (!existingAssembly) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Create a new Panchayath instance
        const newPanchayath = {
            name: name
        };

        // Push the new panchayath to the assembly's panchayaths array
        existingAssembly.municipality.push(newPanchayath);

        // Save the updated district
        await existingDistrict.save();

        res.status(201).json({ message: "Panchayath added successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error adding panchayath:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
const deleteCorporation = async (req, res) => {
    try {
        const { district, constituency, assembly, corporation } = req.body;

        // Check if district, constituency, assembly, and panchayath are provided
        if (!district || !constituency || !assembly || !corporation) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the assembly within the found constituency
        const existingAssembly = existingConstituency.assemblies.find(a => a.name === assembly);

        // If assembly not found
        if (!existingAssembly) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Find the index of the panchayath within the found assembly
        const panchayathIndex = existingAssembly.corporation.findIndex(p => p.name === corporation);

        // If panchayath not found
        if (panchayathIndex === -1) {
            return res.status(404).json({ error: "Corporation not found within the assembly" });
        }

        // Remove the panchayath from the assembly's panchayaths array
        existingAssembly.corporation.splice(panchayathIndex, 1);

        // Save the updated district
        await existingDistrict.save();

        res.status(200).json({ message: "Corporation deleted successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error deleting Corporation:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const deleteMunicipality = async (req, res) => {
    try {
        const { district, constituency, assembly, municipality } = req.body;

        // Check if district, constituency, assembly, and panchayath are provided
        if (!district || !constituency || !assembly || !municipality) {
            return res.status(400).json({ error: "Please provide all required fields." });
        }

        // Find the district with the provided name
        const existingDistrict = await District.findOne({ name: district });

        // If district not found
        if (!existingDistrict) {
            return res.status(404).json({ error: "District not found" });
        }

        // Find the constituency within the found district
        const existingConstituency = existingDistrict.constituencies.find(c => c.name === constituency);

        // If constituency not found
        if (!existingConstituency) {
            return res.status(404).json({ error: "Constituency not found within the district" });
        }

        // Find the assembly within the found constituency
        const existingAssembly = existingConstituency.assemblies.find(a => a.name === assembly);

        // If assembly not found
        if (!existingAssembly) {
            return res.status(404).json({ error: "Assembly not found within the constituency" });
        }

        // Find the index of the panchayath within the found assembly
        const panchayathIndex = existingAssembly.municipality.findIndex(p => p.name === municipality);

        // If panchayath not found
        if (panchayathIndex === -1) {
            return res.status(404).json({ error: "Municipality not found within the assembly" });
        }

        // Remove the panchayath from the assembly's panchayaths array
        existingAssembly.corporation.splice(panchayathIndex, 1);

        // Save the updated district
        await existingDistrict.save();

        res.status(200).json({ message: "Municipality deleted successfully", district: existingDistrict });
    } catch (error) {
        console.error("Error deleting Municipality:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
module.exports = {
    getMandalam,
    addMandalam,
    deleteMandalam,
    addDistrict,
    addConstituency,
    addAssembly,
    addPanchayath,
    getDistrictV4,
    deleteDistrict,
    deleteConstituency,
    deleteAssembly,
    deletePanchayath,
    addCorporation,
    deleteCorporation,
    addMunicipality,
    deleteMunicipality,
}