"use client"
import { ChangeEventHandler, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import styled from "@emotion/styled";

const MainWithPadding = styled.main`
  padding: 32px;
`;
const StyledCard = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background-color: white;
  color: black;
  border: 1px solid lightGray;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const StyledImage = styled(Image)`
  width: 50%;
  height: "auto"
`;

const DescriptionList = styled.dl`
  width: 100%;

  dt {
    font-weight: bold
  }
`;

type StatusColors = { 
  "Alive": string;
  "Dead": string;
  "unknown": string;
}

const statusColors: StatusColors = {
  "Alive": "green",
  "Dead": "red",
  "unknown": "gray"
}

const DescriptionDetailWithStatus = styled.dd<{ status: string }>`
  color: ${({ status }) => statusColors[status as keyof StatusColors]}
`;

type CharacterStatus = "Alive" | "Dead" | "unknown"
type CharacterGender = "Male" | "Female"

// TODO: Move to 'Next-y' way to fetch data
type Result = {
  gender: CharacterGender;
  image: string;
  name: string;
  status: CharacterStatus;
  species: string;
}

const getData = async () => {
  const results =  await fetch('https://rickandmortyapi.com/graphql', {
  method: 'POST',

  headers: {
    "Content-Type": "application/json"
  },

  body: JSON.stringify({
    query: `{
      characters {
        results {
          image
          species
          name
          status
          gender
        }
      }
    }`
  })
  })

  const resultsJson = await results.json()
  console.log({resultsJson})
  return resultsJson
}


// Working under the assumption this would be a different file
// TODO: Move this to own file
type Character = Pick<Result, "name" | "status" | "species"> & {
  imageUrl: Result["image"];
}

const CharacterCard = ({ name, imageUrl, status, species }: Character) => {

  return (
    <StyledCard>
      <StyledImage src={imageUrl} alt={`image of ${name}`} width={100} height={100}/>
      <DescriptionList>
        <dt>Name:</dt>
        <dl>{name}</dl>
        <dt>Status:</dt>
        <DescriptionDetailWithStatus status={status}>{status}</DescriptionDetailWithStatus>
        <dt>Species:</dt>
        <dd>{species}</dd>
      </DescriptionList>
    </StyledCard>
  )
};

// Working under the assumption this would be a different file
// TODO: Move this to own file
type GenderFilterProps = {
  onChange?: (value: CharacterGender) => void;
  value?: CharacterGender;
}

const GenderFilter = ({ onChange, value }: GenderFilterProps) => {

  const handleChange = useCallback<ChangeEventHandler<HTMLSelectElement>>((event) => {
    const value = event.target.value as CharacterGender;
    onChange?.(value);
  }, [onChange])

  return (
    <>
      <label htmlFor="gender-select">Filter by gender:</label>
      <select value={value || ""} onChange={handleChange} id="gender-select">
        <option value="">--Please choose an option--</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    </>
  )
}

// Working under the assumption this would be a different file
// TODO: Move this to own file
type StatusFilterProps = {
  onChange?: (value: CharacterStatus) => void;
  value?: CharacterStatus;
}

const StatusFilter = ({ onChange, value }: StatusFilterProps) => {

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>((event) => {
    const value = event.target.value as CharacterStatus;
    onChange?.(value);
  }, [onChange])

  return (
    <fieldset>
      <legend>Filter by status:</legend>

      <div>
        <input onChange={handleChange} type="radio" id="alive" name="status" value="Alive" checked={value === "Alive"} />
        <label htmlFor="alive">Alive</label>
      </div>

      <div>
        <input onChange={handleChange} type="radio" id="dead" name="status" value="Dead" checked={value === "Dead"} />
        <label htmlFor="dead">Dead</label>
      </div>

      <div>
        <input onChange={handleChange} type="radio" id="unknown" name="status" value="unknown" checked={value === "unknown"} />
        <label htmlFor="unknown">Unknown</label>
      </div>
    </fieldset>

  )
}

type Filters = {
  gender?: CharacterGender;
  status?: CharacterStatus;
}

const Home = () => {
  const [characters, setCharacters] = useState<Result[]>();
  const [filters, setFilters] = useState<Filters>({
    gender: window.localStorage.getItem("gender-filter") as CharacterGender,
    status: window.localStorage.getItem("status-filter") as CharacterStatus
  });

  useEffect(() => {
    // TODO: Move this to the 'Next-y' way of data fetching
    const getDataOnLoad = async () => {
      const result = await getData();
      setCharacters(result.data.characters.results)
    };
    getDataOnLoad();
  }, []);

  const filteredCharacters = useMemo(() => {
    // TODO: There is a better way to do this. 
    if (filters?.gender && filters?.status) {
      return characters?.filter((character) => character.gender === filters?.gender && character.status === filters?.status)
    }

    if (filters?.gender) {
      return characters?.filter((character) => character.gender === filters?.gender)
    }

    if (filters?.status) {
      return characters?.filter((character) => character.status === filters?.status)
    }

    return characters
  }, [characters, filters])
  
  const handleGenderFilterChange = (gender: CharacterGender) => {
    window.localStorage.setItem("gender-filter", gender)
    setFilters({
      ...filters,
      gender
    })
  }

  const handleStatusFilterChange = (status: CharacterStatus) => {
    window.localStorage.setItem("status-filter", status)
    setFilters({
      ...filters,
      status
    })
  }

  const clearFilters = () => {
    window.localStorage.clear();
    setFilters({
      gender: undefined,
      status: undefined
    })

  }

  return (
    <MainWithPadding>
      <div>
        <GenderFilter value={filters?.gender} onChange={handleGenderFilterChange} />
        <StatusFilter value={filters?.status} onChange={handleStatusFilterChange} />
        <button onClick={clearFilters}>Clear filters</button>
      </div>
      <Grid>
        {filteredCharacters?.map((character: Result, index: number) => {
          const { image, name, status, species } = character;

          return <CharacterCard key={`${index}`} imageUrl={image} name={name} status={status} species={species} />
        })}
      </Grid>
    </MainWithPadding>
  );
}

export default Home


